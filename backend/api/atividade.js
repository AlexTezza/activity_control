const Redmine = require('node-redmine');

module.exports = app => {
    const { existsOrError, notExistsOrError, objectContainsIdOrErro, validateHourStartEnd, validateTask } = app.api.validation
    const INSERT = 'insert';
    const REPLACE = 'replace';
    const UPDATE = 'update';
    const REMOVE = 'remove';
    const ERROR = 'error';

    const save = async (req, res) => {
        const atividade = { ...req.body }

        if (req.params.id) {
            atividade.id = req.params.id
        }

        try {
            existsOrError(atividade.idUsuario, 'Usuário não informado')
            objectContainsIdOrErro(atividade.tipoAtividade, 'Tipo Atividade não informada')
            existsOrError(atividade.horaInicio, 'Hora início não informada')
            existsOrError(atividade.horaFim, 'Hora fim não informada')
            validateHourStartEnd(atividade.horaInicio, atividade.horaFim, "A hora de Início não pode ser maior que a hora Fim")
            validateTask(atividade.tarefa, "O número informado no campo Task é inválido")
            existsOrError(atividade.descricao, 'Descrição não informada')
            existsOrError(atividade.data, 'Data não informada')

            atividade.idTipoAtividade = atividade.tipoAtividade.id;
            delete atividade.tipoAtividade

            if (atividade.tarefa === "") {
                atividade.tarefa = null
            }

            const atividadeFromDB = await app.db('atividade')
                .where({ data: atividade.data, idUsuario: atividade.idUsuario })
                .where(function () {
                    this
                        .where({ horaInicio:  atividade.horaInicio})
                        .orWhere({ horaFim: atividade.horaFim })
                })
                .first()
            if(!atividade.id) {
                notExistsOrError(atividadeFromDB, 'Hora Início/Fim já foi registrada em outra atividade')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (atividade.id) {
            const oldDbAtividade = await app.db('atividade').where({id: atividade.id}).first();

            app.db('atividade')
                .update(atividade)
                .where({ id: atividade.id })
                .then(() => syncWithRedmine(oldDbAtividade, atividade, res))
                .catch(err => {
                    return res.status(500).send(err);
                });
        } else {
            app.db('atividade')
                .insert(atividade)
                .returning('id')
                .then(id => {
                    atividade.id = id[0];
                    return syncWithRedmine(null, atividade, res);
                })
                .catch(err => {
                    return res.status(500).send(err);
                });
        }
    }

    const syncWithRedmine = async (oldAtividade, atividade, res) => {
        const action = getSyncAction(oldAtividade, atividade);

        if (!action) {
            return res.status(201).send();
        }

        const {redmineId, redmineApiKey, redmineAllowSync} = await app.db('usuario')
            .select('redmineApiKey','redmineId','redmineAllowSync')
            .where({id: atividade.idUsuario})
            .first()
            .then(response => {
                return {
                    redmineId: response.redmineId,
                    redmineApiKey: response.redmineApiKey,
                    redmineAllowSync: response.redmineAllowSync,
                };
            })
            .catch(e => {
                console.log(e);
            })

        if (!redmineAllowSync) {
            return res.status(201).send();
        }

        const {url} = await app.db('redmine')
            .select('url')
            .where({id: redmineId})
            .first()
            .catch(e => {
                console.log(e);
            });

        const redmine = new Redmine(url, {apiKey: redmineApiKey})
        const activity_id = await getActivityId(atividade.idTipoAtividade, redmineId)

        switch(action) {
            case INSERT:
                const time_entry = {
                    time_entry: {
                        issue_id: atividade.tarefa,
                        spent_on: atividade.data.substr(0,10),
                        activity_id,
                        comments: atividade.descricao,
                        hours: atividade.duracao / 60
                    }
                };

                return redmine.create_time_entry(time_entry, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    }
                    return app.db('atividade')
                        .update({
                            redmineTaskId: data.time_entry.id
                        })
                        .where({id: atividade.id})
                        .then(res.status(201).send())
                        .catch(error => {
                            console.log(error);
                            return res.status(500).send(error);
                        });
                });

            case REPLACE:
                const another_time_entry = {
                    time_entry: {
                        issue_id: atividade.tarefa,
                        spent_on: atividade.data.substr(0,10),
                        activity_id,
                        comments: atividade.descricao,
                        hours: atividade.duracao / 60
                    }
                };

                return redmine.delete_time_entry(atividade.redmineTaskId, (e, data) => {
                    if (e) {
                        console.log(e);
                        return res.status(500).send(err);
                    }
                    return redmine.create_time_entry(another_time_entry, (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        }
                        return app.db('atividade')
                            .update({
                                redmineTaskId: data.time_entry.id
                            })
                            .where({id: atividade.id})
                            .then(res.status(201).send())
                            .catch(error => {
                                console.log(error);
                                return res.status(500).send(error);
                            });
                    });
                });

            case UPDATE:
                const updated_time_entry = {
                    time_entry: {
                        issue_id: atividade.tarefa,
                        spent_on: atividade.data.substr(0,10),
                        activity_id,
                        comments: atividade.descricao,
                        hours: atividade.duracao / 60
                    }
                };

                return redmine.update_time_entry(atividade.redmineTaskId, updated_time_entry, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    }
                    return res.status(201).send();
                });

            case REMOVE:
                return redmine.delete_time_entry(atividade.redmineTaskId, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    }
                    return app.db('atividade')
                        .update({
                            redmineTaskId: null
                        })
                        .where({id: atividade.id})
                        .then(res.status(201).send())
                        .catch(error => {
                            console.log(error);
                            return res.status(500).send(error);
                        });
                });
            default:
                return res.status(500).send(err);
        }
    }

    function getSyncAction(oldAtividade, atividade) {
        const {tarefa: oldTarefa} = oldAtividade || {};
        const {tarefa} = atividade;

        if (!oldAtividade) {
            if (tarefa) {
                return INSERT;
            } else {
                return null;
            }
        } else {
            if (!oldTarefa && !tarefa) {
                return null;
            }
            if (oldTarefa && tarefa && oldTarefa !== tarefa) {
                return REPLACE;
            }
            if (oldTarefa && tarefa && oldTarefa === tarefa) {
                return UPDATE;
            }
            if (oldTarefa && !tarefa) {
                return REMOVE;
            }
            return ERROR;
        }
    }

    function getActivityId(idTipoAtividade, redmineId) {
        return app.db('redmineActivities')
            .select('activityExternalId')
            .join('redmineActivities_tipoAtividade', 'redmineActivities_tipoAtividade.redmineActivitiesId', 'redmineActivities.id')
            .whereRaw(`"redmineActivities"."redmineId" = ${redmineId} AND "redmineActivities_tipoAtividade"."tipoAtividadeId" = ${idTipoAtividade}`)
            .first()
            .then(res => res.activityExternalId)
            .catch(e => {
                console.log(e);
            });
    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.db('atividade')
                .where({ id: req.params.id }).del()

            try {
                existsOrError(rowsDeleted, 'Tipo Atividade não foi encontrado.')
            } catch(msg) {
                return res.status(400).send(msg)
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }
    }

    const limit = 15 // usado para paginação

    const get = async (req, res) => {
        const page = req.query.page || 1
        const idUsuario = req.query.usuario || null

        const count = await getGetCount(idUsuario)

        app.db({ a: 'atividade', ta: 'tipoAtividade' })
            .select('a.id', 'a.idUsuario', 'a.horaInicio', 'a.horaFim', 'a.duracao', 'a.tarefa', 'a.descricao', 'a.data', 'a.redmineTaskId',
                { idTipoAtividade: 'ta.id', tipoAtividadeDescricao: 'ta.descricao' } )
            .limit(limit).offset(page * limit - limit)
            .where({'a.idUsuario': idUsuario}) // Filtro por usuário
            .whereRaw('?? = ??', ['ta.id', 'a.idTipoAtividade'])
            .orderBy('a.data', 'desc')
            .orderBy('a.horaInicio', 'desc')
            .then(atividades => atividades.map(atividade => {
                atividade.tipoAtividade = {
                    id: atividade.idTipoAtividade,
                    descricao: atividade.tipoAtividadeDescricao
                }

                // Formata a data
                atividade.data = atividade.data.toISOString().split('T')[0]

                delete atividade.idTipoAtividade
                delete atividade.tipoAtividadeDescricao

                return atividade
            }))
            .then(atividades => res.json({ data: atividades, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('atividade')
            .where({ id: req.params.id })
            .first()
            .catch(err => res.status(500).send(err))
    }

    const search = async (req, res) => {
        const page = req.params.page || 1
        const count = await getSearchCount(req)
        const amount = await getAmountDuracao(req)

        app.db({ a: 'atividade', ta: 'tipoAtividade' })
            .select('a.id', 'a.idUsuario', 'a.horaInicio', 'a.horaFim', 'a.duracao', 'a.tarefa', 'a.descricao', 'a.data', 'a.redmineTaskId', { idTipoAtividade: 'ta.id', tipoAtividadeDescricao: 'ta.descricao' } )
            .modify(function(queryBuilder) {
                if (req.params.idUsuario && req.params.idUsuario != 'null') {
                    queryBuilder.where({ 'a.idUsuario': req.params.idUsuario })
                }
                if (req.params.tarefa && req.params.tarefa != 'null') {
                    queryBuilder.andWhere('a.tarefa', '=', `${Number.parseFloat(req.params.tarefa)}`)
                }
                if (req.params.descricao && req.params.descricao != 'null') {
                    queryBuilder.andWhere('a.descricao', 'ilike', `%${req.params.descricao}%`)
                }
                if (req.params.idTipoAtividade && req.params.idTipoAtividade != 'null') {
                    queryBuilder.andWhere({ 'a.idTipoAtividade': req.params.idTipoAtividade })
                }
                if ((req.params.dataDe && req.params.dataDe != 'null')
                    && (req.params.dataAte && req.params.dataAte != 'null')) {

                    queryBuilder.whereBetween( 'a.data', [req.params.dataDe, req.params.dataAte] )
                } else {
                    if (req.params.dataDe && req.params.dataDe != 'null') {
                        queryBuilder.andWhere({ 'a.data': req.params.dataDe })
                    }
                    if (req.params.dataAte && req.params.dataAte != 'null') {
                        queryBuilder.andWhere({ 'a.data': req.params.dataAte })
                    }
                }
            })
            .limit(limit).offset(page * limit - limit)
            .whereRaw('?? = ??', ['ta.id', 'a.idTipoAtividade'])
            .orderBy('a.data', 'desc')
            .orderBy('a.horaInicio', 'desc')
            .then(atividades => atividades.map(atividade => {
                atividade.tipoAtividade = {
                    id: atividade.idTipoAtividade,
                    descricao: atividade.tipoAtividadeDescricao
                }

                // Formata a data
                atividade.data = atividade.data.toISOString().split('T')[0]

                delete atividade.idTipoAtividade
                delete atividade.tipoAtividadeDescricao

                return atividade
            }))
            .then(atividades => res.json({ data: atividades, count, limit, amount }))
            .catch(err => res.status(500).send(err))

    }

    async function getGetCount(idUsuario) {
        const result = await app.db('atividade')
            .where({'idUsuario': idUsuario})
            .count('id')
            .first()
        return parseInt(result.count)
    }

    async function getSearchCount(req) {
        const result = await app.db('atividade')
            .modify(function(queryBuilder) {
                if (req.params.idUsuario && req.params.idUsuario != 'null') {
                    queryBuilder.where({ idUsuario: req.params.idUsuario })
                }
                if (req.params.tarefa && req.params.tarefa != 'null') {
                    queryBuilder.andWhere('tarefa', '=', `${Number.parseFloat(req.params.tarefa)}`)
                }
                if (req.params.descricao && req.params.descricao != 'null') {
                    queryBuilder.andWhere('descricao', 'ilike', `%${req.params.descricao}%`)
                }
                if (req.params.idTipoAtividade && req.params.idTipoAtividade != 'null') {
                    queryBuilder.where({ idTipoAtividade: req.params.idTipoAtividade })
                }
                if ((req.params.dataDe && req.params.dataDe != 'null')
                    && (req.params.dataAte && req.params.dataAte != 'null')) {

                    queryBuilder.whereBetween( 'data', [req.params.dataDe, req.params.dataAte] )
                } else {
                    if (req.params.dataDe && req.params.dataDe != 'null') {
                        queryBuilder.andWhere({ 'data': req.params.dataDe })
                    }
                    if (req.params.dataAte && req.params.dataAte != 'null') {
                        queryBuilder.andWhere({ 'data': req.params.dataAte })
                    }
                }
            })
            .count('id')
            .first()
        return parseInt(result.count)
    }

    async function getAmountDuracao(req) {
        const result = await app.db('atividade')
            .modify(function(queryBuilder) {
                if (req.params.idUsuario && req.params.idUsuario != 'null') {
                    queryBuilder.where({ idUsuario: req.params.idUsuario })
                }
                if (req.params.tarefa && req.params.tarefa != 'null') {
                    queryBuilder.andWhere('tarefa', '=', `${Number.parseFloat(req.params.tarefa)}`)
                }
                if (req.params.descricao && req.params.descricao != 'null') {
                    queryBuilder.andWhere('descricao', 'ilike', `%${req.params.descricao}%`)
                }
                if (req.params.idTipoAtividade && req.params.idTipoAtividade != 'null') {
                    queryBuilder.where({ idTipoAtividade: req.params.idTipoAtividade })
                }
                if ((req.params.dataDe && req.params.dataDe != 'null')
                    && (req.params.dataAte && req.params.dataAte != 'null')) {

                    queryBuilder.whereBetween( 'data', [req.params.dataDe, req.params.dataAte] )
                } else {
                    if (req.params.dataDe && req.params.dataDe != 'null') {
                        queryBuilder.andWhere({ 'data': req.params.dataDe })
                    }
                    if (req.params.dataAte && req.params.dataAte != 'null') {
                        queryBuilder.andWhere({ 'data': req.params.dataAte })
                    }
                }
            })
            .sum('duracao')
            .first()

        if (result.sum) {
            let totalMinutes = result.sum
            let hours = Math.trunc(totalMinutes / 60)
            let minutes = totalMinutes % 60

            if (hours < 10) {
                hours = `0${hours}`
            }
            if (minutes < 10) {
                minutes = `0${minutes}`
            }

            return `${hours}:${minutes}`
        }
        return 0
    }

    return { save, remove, get, getById, search }
}
