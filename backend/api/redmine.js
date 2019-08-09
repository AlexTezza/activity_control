const Redmine = require('node-redmine');
const config = require('../knexfile.js');
const knex = require('knex')(config);

module.exports = app => {
    const { existsOrError } = app.api.validation

    const sync = async (req, res) => {
        const {id} = req.params
        const atividadeFromDB = await app.db('atividade')
            .where({id})
            .first()

        const redmineFromDB = await app.db('redmine')
            .where({id: atividadeFromDB.idredmine})
            .first()

        const {redmineApiKey: apiKey, redmineUrl} = redmineFromDB
        const {tarefa, duracao, descricao, data} = atividadeFromDB

        const redmine = new Redmine(redmineUrl, {apiKey})

        // const time_entry = {
        //     time_entry: {
        //         issue_id: tarefa,
        //         spent_on: data,
        //         activity_id: '???',
        //         comments: descricao,
        //         hours: duracao,
        //     }
        // }

        // redmine.create_time_entry(time_entry, function(err, data) {
        //     if (err) throw err;
        //     console.log(data);
        // });

        return res.status(500).send()
    }

    const getTimeEntry = async () => {
        console.log('bla')
    }

    const save = async (req, res) => {
        const redmine = { ...req.body };
        const {id} = req.params;

        if (id) {
            redmine.id = id;
        }

        try {
            existsOrError(redmine.url, 'Url não informada');
        } catch(msg) {
            return res.status(400).send(msg);
        }

        if (!redmine.description || 0 === redmine.description.length) {
            redmine.description = redmine.url;
        }

        if (redmine.id) {
            app.db('redmine')
                .update(redmine)
                .where({ id: redmine.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err));
        } else {
            const apiKey = redmine.apikey;
            delete redmine.apikey;

            app.db('redmine')
                .insert(redmine)
                .returning('id')
                .then(response => {
                    const redmineId = response[0];
                    insertRedmineActivities(redmineId, redmine.url, apiKey, res);
                })
                .catch(err => res.status(500).send(err));
        }
    }

    const insertRedmineActivities = (redmineId, url, apiKey, res) => {
        const redmineApi = new Redmine(url, {apiKey});

        redmineApi.time_entry_activities((err, data) => {
            const {time_entry_activities} = data;
            const items = getRedmineActivitiesEntities(time_entry_activities, redmineId);

            knex.batchInsert('redmineActivities', items, 1000)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err));
        });
    }

    const getRedmineActivitiesEntities = (time_entry_activities, redmineId) => {
        let redmineActivities = [];

        time_entry_activities.forEach(element => {
            redmineActivities.push({
                description: element.name,
                activityExternalId: element.id,
                redmineId: redmineId,
            });
        });

        return redmineActivities;
    }

    const limit = 15 // usado para paginação

    const get = async (req, res) => {
        const {page = 1, active} = req.query;

        if (active !== undefined) {
            const result = await app.db('redmine')
                .count('id')
                .where({active})
                .first()
            const count = parseInt(result.count)

            app.db('redmine')
                .select('id', 'description', 'url', 'active')
                .limit(limit).offset(page * limit - limit)
                .where({active})
                .then(redmines => res.json(redmines))
                .catch(err => res.status(500).send(err))
        } else {
            const result = await app.db('redmine')
                .count('id')
                .first()
            const count = parseInt(result.count)

            app.db('redmine')
                .select('id', 'description', 'url', 'active')
                .limit(limit).offset(page * limit - limit)
                .then(redmines => res.json(redmines))
                .catch(err => res.status(500).send(err))
        }
    }

    const getById = (req, res) => {
        app.db('redmine')
            .select('id', 'description', 'url', 'active')
            .where({ id: req.params.id} )
            .first()
            .then(redmine => res.json(redmine))
            .catch(err => res.status(500).send(err))
    }

    return { sync, getTimeEntry, save, getById, get, insertRedmineActivities, getRedmineActivitiesEntities }
}
