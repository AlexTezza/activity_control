
exports.up = function(knex, Promise) {
    return knex.schema.table('atividade', table => {
        table.string('redmineSyncPendency')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('atividade', table => {
        table.dropColumn('redmineSyncPendency')
    })
};
