
exports.up = function(knex, Promise) {
    return knex.schema.createTable('usuarioDepartamento', table => {
        table.increments('id').primary()
        table.integer('idUsuario').references('id')
            .inTable('usuario').notNull()
        table.integer('idDepartamento').references('id')
            .inTable('departamento').notNull()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('usuarioDepartamento')
};
