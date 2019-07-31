
exports.up = function(knex, Promise) {
    return knex.schema.table('tipoAtividade', table => {
        table.integer('idFuncao').references('id')
            .inTable('funcao')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tipoAtividade', table => {
        table.dropColumn('tarefa')
    })
};
