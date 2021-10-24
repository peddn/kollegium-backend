/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

'use strict';



module.exports = {

    create: async (ctx) => {
        let result = await strapi.query('user').find();
        console.log(result);

        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.letter.create(data, { files });
        } else {
          entity = await strapi.services.letter.create(ctx.request.body);
        }
        console.log(entity);
        return sanitizeEntity(entity, { model: strapi.models.letter });
    }

};
