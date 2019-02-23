
exports.up = function(knex, Promise) {
    return knex.schema.createTable('atividade', table => {
        table.increments('id').primary()
        table.string('descricao', 3000).notNull()
        table.string('horaInicio').notNull()
        table.string('horaFim').notNull()
        table.integer('duracao').notNull()
		table.timestamp('data').notNull()
        table.integer('idUsuario').references('id')
            .inTable('usuario').notNull()
        table.integer('idTipoAtividade').references('id')
            .inTable('tipoAtividade').notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('atividade')
};
