
exports.up = function(knex, Promise) {
    return knex.schema.table('usuario', table => {
        table.integer('redmineId').references('id')
            .inTable('redmine')
        table.string('redmineApiKey')
        table.boolean('redmineAllowSync').notNull().default(false)
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('usuario', table => {
        table.dropColumn('redmineId')
        table.dropColumn('redmineApiKey')
        table.dropColumn('redmineAllowSync')
    })
};
