
exports.up = function(knex, Promise) {
    return knex.schema.createTable('redmine', table => {
        table.increments('id').primary()
        table.string('url', 3000).notNull()
        table.string('description', 255)
        table.boolean('active').notNull().default(true)
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('redmine')
};
