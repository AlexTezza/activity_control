﻿module.exports = app => {
    const { existsOrError, notExistsOrError, objectContainsIdOrErro, validateHourStartEnd, validateTask } = app.api.validation
    const { formatterMinutesToHours } = app.api.utils
    
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
            app.db('atividade')
            .update(atividade)
            .where({ id: atividade.id })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
        } else {
            app.db('atividade')
                .insert(atividade)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
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
            .select('a.id', 'a.idUsuario', 'a.horaInicio', 'a.horaFim', 'a.duracao', 'a.tarefa', 'a.descricao', 'a.data',
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
            .select('a.id', 'a.idUsuario', 'a.horaInicio', 'a.horaFim', 'a.duracao', 'a.tarefa', 'a.descricao', 'a.data', { idTipoAtividade: 'ta.id', tipoAtividadeDescricao: 'ta.descricao' } )
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
            return formatterMinutesToHours(result.sum)
        }
        return 0
    }

    return { save, remove, get, getById, search }
}