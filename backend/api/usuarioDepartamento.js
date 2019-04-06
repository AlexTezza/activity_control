module.exports = app => {
    const { existsOrError, notExistsOrError, objectContainsIdOrErro } = app.api.validation

    const save = async (req, res) => {
        const usuarioDepartamento = { ...req.body }

        if (req.params.id) {
            usuarioDepartamento.id = req.params.id
        }

        try {
            objectContainsIdOrErro(usuarioDepartamento.departamento, 'Departamento não informado')
            objectContainsIdOrErro(usuarioDepartamento.usuario, 'Usuário não informado')

            usuarioDepartamento.idDepartamento = usuarioDepartamento.departamento.id;
            delete usuarioDepartamento.departamento

            usuarioDepartamento.idUsuario = usuarioDepartamento.usuario.id
            delete usuarioDepartamento.usuario

            const usuarioDepartamentoFromDB = await app.db('usuarioDepartamento')
                .where({ idUsuario: usuarioDepartamento.idUsuario, idDepartamento: usuarioDepartamento.idDepartamento })
                .first()
            if(!usuarioDepartamento.id) {
                notExistsOrError(usuarioDepartamentoFromDB, 'Este Usuário já possui vínculo com este Departamento')
            }
        } catch (msg) {
            return res.status(400).send(msg)
        }


        if (usuarioDepartamento.id) {
            app.db('usuarioDepartamento')
                .update(usuarioDepartamento)
                .where({ id: usuarioDepartamento.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('usuarioDepartamento')
                .insert(usuarioDepartamento)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {

        try {
            const rowsDeleted = await app.db('usuarioDepartamento')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(rowsDeleted, 'usuarioDepartamento não foi encontrado.')
            } catch(msg) {
                return res.status(400).send(msg)
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }
    }

    const limit = 10 // usado para paginação

    const get = async (req, res) => {
        const page = req.query.page || 1

        const result = await app.db('usuarioDepartamento').count('id').first()
        const count = parseInt(result.count)

        app.db('usuarioDepartamento as ud')
            .join('departamento as d', 'd.id', 'ud.idDepartamento')
            .join('usuario as u', 'u.id', 'ud.idUsuario')
            .select('ud.id', 'ud.idUsuario', 'ud.idDepartamento', { idDepartemanto: 'd.id', descricao: 'd.descricao'}, { idUsuario: 'u.id', nome: 'u.nome'})
            .limit(limit).offset(page * limit - limit)
            .then(usuariosDepartamentos => usuariosDepartamentos.map(usuarioDepartamento => {
                usuarioDepartamento.departamento = {
                    id: usuarioDepartamento.idDepartemanto,
                    descricao: usuarioDepartamento.descricao
                }
                usuarioDepartamento.usuario = {
                    id: usuarioDepartamento.idUsuario,
                    nome: usuarioDepartamento.nome
                }

                delete usuarioDepartamento.idDepartamento
                delete usuarioDepartamento.descricao
                delete usuarioDepartamento.descricao
                delete usuarioDepartamento.nome

                return usuarioDepartamento
            }))
            .then(usuarioDepartamentos => res.json({ data: usuarioDepartamentos, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('usuarioDepartamento')
            .where({ id: req.params.id })
            .first()
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById }
}