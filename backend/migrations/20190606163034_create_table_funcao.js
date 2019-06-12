
exports.up = function(knex, Promise) {
    return knex.schema.createTable('funcao', table => {
        table.increments('id').primary()
        table.string('descricao').notNull()
        table.string('sigla', 10).notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('funcao')
};