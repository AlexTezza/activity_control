module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        const funcao = { ...req.body }

        if (req.params.id) {
            funcao.id = req.params.id
        }

        try {
            existsOrError(funcao.descricao, 'Descrição não informada')
            existsOrError(funcao.sigla, 'Sigla não informada')

            const funcaoFromDB = await app.db('funcao')
                .where({ sigla: funcao.sigla }).first()
            if(!funcao.id) {
                notExistsOrError(funcaoFromDB, 'Função já cadastrado')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (funcao.id) {
            app.db('funcao')
                .update(funcao)
                .where({ id: funcao.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('funcao')
                .insert(funcao)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.db('funcao')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(rowsDeleted, 'Função não foi encontrado.')
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

        const result = await app.db('funcao')
            .count('id')
            .first()
        const count = parseInt(result.count)

        app.db('funcao')
            .select('id', 'descricao', 'sigla')
            .limit(limit).offset(page * limit - limit)
            .orderBy('descricao')
            .then(funcoes => res.json({data: funcoes, count, limit}))
            .catch(err => res.status(500).send(err))
    }

    const getAll = async (req, res) => {
        app.db('funcao')
            .select('id', 'descricao', 'sigla')
            .orderBy('descricao')
            .then(funcoes => res.json(funcoes))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('funcao')
            .where({ id: req.params.id })
            .first()
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getAll, getById }
}