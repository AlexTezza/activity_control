
exports.up = function(knex, Promise) {
    return knex.schema.createTable('usuario', table => {
        table.increments('id').primary()
        table.string('nome').notNull()
        table.string('email').notNull().unique()
        table.string('senha').notNull()
        table.boolean('admin').notNull().default(false)
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('usuario')
};