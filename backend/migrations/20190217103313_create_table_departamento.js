
exports.up = function(knex, Promise) {
    return knex.schema.createTable('departamento', table => {
        table.increments('id').primary()
        table.string('descricao').notNull()
        table.string('sigla', 10).notNull()
        table.integer('idUsuarioResponsavel').references('id')
            .inTable('usuario').notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('departamento')
};
