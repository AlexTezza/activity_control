
exports.up = function(knex, Promise) {
    return knex.schema.table('atividade', table => {
        table.integer('tarefa')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('atividade', table => {
        table.dropColumn('tarefa')
    })
};
