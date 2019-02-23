const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const encryptPassword = senha => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(senha, salt)
    }

    const save = async (req, res) => {
        const usuario = { ...req.body }

        if(req.params.id) usuario.id = req.params.id
        
        if (!req.originalUrl.startsWith('/usuarios')) {
            usuario.admin = false
        }
        if (!req.user || !req.user.admin) {
            usuario.admin = false
        }

        try {
            existsOrError(usuario.nome, 'Nome não informado')
            existsOrError(usuario.email, 'E-mail não informado')
            existsOrError(usuario.senha, 'Senha não informada')
            existsOrError(usuario.confirmacaoSenha, 'Confirmação de Senha inválida')
            equalsOrError(usuario.senha, usuario.confirmacaoSenha,
                'Senhas não conferem')

            const usuarioFromDB = await app.db('usuario')
                .where({ email: usuario.email }).first()
            if(!usuario.id) {
                notExistsOrError(usuarioFromDB, 'Usuário já cadastrado')
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }

        usuario.senha = encryptPassword(usuario.senha)
        delete usuario.confirmacaoSenha

        if(usuario.id) {
            app.db('usuario')
                .update(usuario)
                .where({ id: usuario.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('usuario')
                .insert(usuario)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const limit = 15 // usado para paginação

    const get = async (req, res) => {
        const page = req.query.page || 1

        const result = await app.db('usuario')
            .count('id')
            .first()
        const count = parseInt(result.count)

        app.db('usuario')
            .select('id', 'nome', 'email', 'admin')
            .limit(limit).offset(page * limit - limit)
            .then(usuarios => res.json(usuarios))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('usuario')
            .select('id', 'nome', 'email', 'admin')
            .where({ id: req.params.id} )
            .first()
            .then(usuario => res.json(usuario))
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try {
            const usuarioDepartamento = await app.db('usuarioDepartamento')
                .where({ idUsuario: req.params.id })
            notExistsOrError(usuarioDepartamento, 'Usuário possui vínculo com Departamento.')

            const atividade = await app.db('atividade')
                .where({ idUsuario: req.params.id })
            notExistsOrError(atividade, 'Usuário possui vínculo com Atividade.')

            const rowsDeleted = await app.db('usuario')
                .where({ id: req.params.id })
                .del()

            try {
                existsOrError(rowsDeleted, 'Usuário não foi encontrado.')
            } catch(msg) {
                return res.status(400).send(msg)
            }

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }
    
    return { save, get, getById, remove }
}