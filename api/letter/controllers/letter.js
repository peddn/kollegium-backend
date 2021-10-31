/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {

  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.letter.create(data, { files });
    } else {
      entity = await strapi.services.letter.create(ctx.request.body);
    }
    const users = await strapi.query('user', 'users-permissions').find();
    for (const user of users) {
      const role = user.role.name;
      if (role === 'teacher' || role === 'principal') {
        await strapi.services.perusal.create({
          signed: false,
          date: new Date(),
          owner: user.id,
          letter: entity.id
        })
      }
    }
    return sanitizeEntity(entity, { model: strapi.models.letter });
  },

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.letter.search(ctx.query);
    } else {
      entities = await strapi.services.letter.find(ctx.query);
    }
    for (let letter of entities) {
      const perusalsSignedCount = await strapi.services.perusal.count({ letter: [letter.id], signed: true });
      const perusalsUnsignedCount = await strapi.services.perusal.count({ letter: [letter.id], signed: false });
      letter.signedCount = perusalsSignedCount;
      letter.unsignedCount = perusalsUnsignedCount;
    }
    return entities.map(entity => {
      const letter = sanitizeEntity(entity, {
        model: strapi.models.letter
      });
      return letter;
    });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const perusals = await strapi.services.perusal.find({ letter: id });
    for (let perusal of perusals) {
      const perusalId = perusal.id;
      await strapi.services.perusal.delete({ id: perusalId })
    }
    const entity = await strapi.services.letter.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.letter });
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx.request;
    const entity = await strapi.services.letter.findOne({ id });
    if (query.hasOwnProperty('format')) {
      switch (query.format) {
        case 'csv':
          ctx.response.set('Content-Disposition', 'attachment; filename="export.csv"');
          ctx.response.set('Content-Type', 'text/csv;  charset=UTF-8');
          let body = 'Nachname;Vorname;gesichet\n';
          const perusals = await strapi.services.perusal.find({ letter: id });
          for (let perusal of perusals) {
            const ownerId = perusal.owner.id;
            const owner = await strapi.query('user', 'users-permissions').findOne({ id: ownerId });
            console.log(owner);
            let signed = '';
            if(perusal.signed) {
              signed = perusal.date;
            } else {
              signed = 'nicht gesichtet';
            }
            body += owner.lastName + ';' + owner.firstName + ';' + signed + '\n'
          }
          ctx.response.body = body;
          return
        //return { message: 'download' }
        default:
          break;
      }
    }
    return sanitizeEntity(entity, { model: strapi.models.letter })
  },

};
