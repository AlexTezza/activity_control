module.exports = app => {
    const { existsOrError, notExistsOrError, objectContainsIdOrErro } = app.api.validation

    const save = async (req, res) => {
        const tipoAtividade = { ...req.body }

        if (req.params.id) {
            tipoAtividade.id = req.params.id
        }

        tipoAtividade.idFuncao = tipoAtividade.funcao.id;
        delete tipoAtividade.funcao

        try {
            existsOrError(tipoAtividade.descricao, 'Descrição não informada')
            existsOrError(tipoAtividade.sigla, 'Sigla não informada')
            existsOrError(tipoAtividade.idFuncao, 'Função não informada')

            const tipoAtividadeFromDB = await app.db('tipoAtividade')
                .where({ sigla: tipoAtividade.sigla }).first()
            if(!tipoAtividade.id) {
                notExistsOrError(tipoAtividadeFromDB, 'Tipo Atividade já cadastrado')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (tipoAtividade.id) {
            app.db('tipoAtividade')
                .update(tipoAtividade)
                .where({ id: tipoAtividade.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('tipoAtividade')
                .insert(tipoAtividade)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.db('tipoAtividade')
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

        const result = await app.db('tipoAtividade')
            .count('id')
            .first()
        const count = parseInt(result.count)

        app.db({ ta: 'tipoAtividade', f: 'funcao'})
            .select('ta.id', 'ta.descricao', 'ta.idFuncao', 'ta.sigla',
                { descricaoFuncao: 'f.descricao' })
            .whereRaw('?? = ??', ['f.id', 'ta.idFuncao'])
            .limit(limit).offset(page * limit - limit)
            .orderBy('descricao')
            .then(tipoAtividades => tipoAtividades.map(tipoAtividade => {
                tipoAtividade.funcao = {
                    id: tipoAtividade.idFuncao,
                    descricao: tipoAtividade.descricaoFuncao
                }

                delete tipoAtividade.descricaoFuncao

                return tipoAtividade
            }))
            .then(tipoAtividades => res.json({data: tipoAtividades, count, limit}))
            .catch(err => res.status(500).send(err))
    }

    const getAll = async (req, res) => {
        app.db({ ta: 'tipoAtividade', f: 'funcao'})
            .select('ta.id', 'ta.descricao', 'ta.idFuncao', 'ta.sigla',
                { descricaoFuncao: 'f.descricao' })
            .whereRaw('?? = ??', ['f.id', 'ta.idFuncao'])
            .orderBy('descricao')
            .then(tipoAtividades => tipoAtividades.map(tipoAtividade => {
                tipoAtividade.funcao = {
                    id: tipoAtividade.idFuncao,
                    descricao: tipoAtividade.descricaoFuncao
                }

                delete tipoAtividade.descricaoFuncao

                return tipoAtividade
            }))
            .then(tipoAtividades => res.json(tipoAtividades))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('tipoAtividade')
            .where({ id: req.params.id })
            .first()
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getAll, getById }
}