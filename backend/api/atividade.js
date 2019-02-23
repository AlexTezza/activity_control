module.exports = app => {
    const { existsOrError, notExistsOrError, objectContainsIdOrErro, validarHoraInicioFim } = app.api.validation

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
            validarHoraInicioFim(atividade.horaInicio, atividade.horaFim, "A hora de Início não pode ser maior que a hora Fim")
            existsOrError(atividade.descricao, 'Descrição não informada')
            existsOrError(atividade.data, 'Data não informada')

            atividade.idTipoAtividade = atividade.tipoAtividade.id;
            delete atividade.tipoAtividade

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

        const result = await app.db('atividade')
            .where({'idUsuario': idUsuario}) 
            .count('id')
            .first()
        const count = parseInt(result.count)

        app.db({ a: 'atividade', ta: 'tipoAtividade' })
            .select('a.id', 'a.idUsuario', 'a.horaInicio', 'a.horaFim', 'a.duracao', 'a.descricao', 'a.data', { idTipoAtividade: 'ta.id', tipoAtividadeDescricao: 'ta.descricao' } )
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

    return { save, remove, get, getById }
}