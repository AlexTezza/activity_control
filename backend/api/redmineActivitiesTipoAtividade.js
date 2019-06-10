const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const get = async (req, res) => {
        const {redmineId} = req.query;
        if (!redmineId) {
            return res.status(500).send('parâmetro redmineId é obrigatório');
        }

        const parsedRedmineId = parseInt(redmineId);

        app.db('redmineActivities_tipoAtividade')
            .select('redmineActivities_tipoAtividade.*')
            .innerJoin('redmineActivities', 'redmineActivities_tipoAtividade.redmineActivitiesId', '=', 'redmineActivities.id')
            .where({'redmineActivities.redmineId': parsedRedmineId})
            .then(result => {
                return res.json(result)
            })
            .catch(err => {
                res.status(500).send(err)
            })
    }

    const save = async (req, res) => {
        const {redmineId} = req.query;
        const dePara = { ...req.body };
        let entity = [];

        if (!redmineId) {
            return res.status(500).send('parâmetro redmineId é obrigatório');
        }

        const parsedRedmineId = parseInt(redmineId);

        Object.entries(dePara).forEach((e, l) => {
            const tipoAtividadeId = parseInt(e[0]);
            const redmineActivitiesId = e[1];
            if (tipoAtividadeId && redmineActivitiesId) {
                entity.push({
                    tipoAtividadeId,
                    redmineActivitiesId,
                });
            }
        });

        app.db.transaction(trx => {
            app.db
                .raw('WITH redmineActivities AS (SELECT * FROM "redmineActivities" where "redmineActivities"."redmineId" = ?) ' +
                    'DELETE FROM "redmineActivities_tipoAtividade" ' +
                    'USING redmineActivities ra ' +
                    'WHERE "redmineActivities_tipoAtividade"."redmineActivitiesId" = ra.id', [parsedRedmineId])
                .then(() => {
                    return app.db('redmineActivities_tipoAtividade')
                        .insert(entity)
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
        .then(() => {
            return res.status(204).send();
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).send(err);
        });

    }

    return { get, save }
}
