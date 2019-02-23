module.exports = app => {
    const { existsOrError, notExistsOrError, objectContainsIdOrErro } = app.api.validation

    const save = async (req, res) => {
        const departamento = { ...req.body }

        if (req.params.id) {
            departamento.id = req.params.id
        }

        try {
            existsOrError(departamento.descricao, 'Descrição não informada')
            existsOrError(departamento.sigla, 'Sigla não informada')
            objectContainsIdOrErro(departamento.usuario, 'Responsável não informada')

            departamento.idUsuarioResponsavel = departamento.usuario.id;
            delete departamento.usuario

            const departamentoFromDB = await app.db('departamento')
                .where({ sigla: departamento.sigla }).first()
            if(!departamento.id) {
                notExistsOrError(departamentoFromDB, 'Departamento já cadastrado')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }


        if (departamento.id) {
            app.db('departamento')
                .update(departamento)
                .where({ id: departamento.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('departamento')
                .insert(departamento)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.db('departamento')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(rowsDeleted, 'Departamento não foi encontrado.')
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

        const result = await app.db('departamento').count('id').first()
        const count = parseInt(result.count)

        app.db({ d: 'departamento', u: 'usuario' })
            .select('d.id', 'd.descricao', 'd.sigla', { idUsuario: 'u.id', nome: 'u.nome' })
            .limit(limit).offset(page * limit - limit)
            .whereRaw('?? = ??', ['d.idUsuarioResponsavel', 'u.id'])
            .orderBy('d.descricao')
            .then(departamentos => departamentos.map(departamento => {
                departamento.usuario = {
                    id: departamento.idUsuario,
                    nome: departamento.nome
                }
                delete departamento.idUsuario
                delete departamento.nome

                return departamento
            }))
            .then(departamentos => res.json({ data: departamentos, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('departamento')
            .where({ id: req.params.id })
            .first()
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById }
}