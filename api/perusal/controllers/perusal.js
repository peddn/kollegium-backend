'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
    own: async (ctx) => {
        //console.log(ctx.state.user);
        let entities;
        const userId = ctx.state.user.id;
        entities = await strapi.services.perusal.own({ owner: [ userId ] }, [ 'letter', 'letter.files' ]);
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.perusal }));
    }
};
