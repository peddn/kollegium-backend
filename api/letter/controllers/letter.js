/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {

  async create(ctx) {
    console.log('FINALLY');
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.letter.create(data, { files });
    } else {
      entity = await strapi.services.letter.create(ctx.request.body);
    }

    console.log(entity)


    const users = await strapi.query('user', 'users-permissions').find();
    for(const user of users) {
      const role = user.role.name;
      if(role === 'teacher' || role === 'principal') {
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

};
