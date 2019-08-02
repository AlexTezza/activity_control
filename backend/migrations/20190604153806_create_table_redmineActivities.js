
exports.up = function(knex, Promise) {
    return knex.schema.createTable('redmineActivities', table => {
        table.increments('id').primary()
        table.string('description', 3000).notNull()
        table.integer('activityExternalId').notNull()
        table.integer('redmineId').references('id')
            .inTable('redmine').notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('redmineActivities')
};
