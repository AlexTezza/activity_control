
exports.up = function(knex, Promise) {
    return knex.schema.createTable('redmineActivities_tipoAtividade', table => {
        table.integer('tipoAtividadeId').references('id')
            .inTable('tipoAtividade').notNull()
        table.integer('redmineActivitiesId').references('id')
            .inTable('redmineActivities').notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('redmineActivities_tipoAtividade')
};
