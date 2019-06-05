
exports.up = function(knex, Promise) {
    return knex.schema.table('atividade', table => {
        table.string('redmineTaskId')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('atividade', table => {
        table.dropColumn('redmineTaskId')
    })
};
