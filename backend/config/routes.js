const admin = require('./admin')

module.exports = app => {

    app.post('/signup', app.api.usuario.save)
    app.post('/signin', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)

    app.route('/usuarios')
        .all(app.config.passport.authenticate())
        .post(admin(app.api.usuario.save))
        .get(admin(app.api.usuario.get))

    app.route('/usuarios/:id')
        .all(app.config.passport.authenticate())
        .put(admin(app.api.usuario.save))
        .get(admin(app.api.usuario.getById))
        .delete(admin(app.api.usuario.remove))

    app.route('/departamento')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.departamento.get))
        .post(admin(app.api.departamento.save))

    app.route('/departamento/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.departamento.getById)
        .put(admin(app.api.departamento.save))
        .delete(admin(app.api.departamento.remove))

    app.route('/usuarioDepartamento')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.usuarioDepartamento.get))
        .post(admin(app.api.usuarioDepartamento.save))

    app.route('/usuarioDepartamento/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.usuarioDepartamento.getById)
        .put(admin(app.api.usuarioDepartamento.save))
        .delete(admin(app.api.usuarioDepartamento.remove))

    app.route('/tipoAtividade')
        .all(app.config.passport.authenticate())
        .get(app.api.tipoAtividade.get)
        .post(app.api.tipoAtividade.save)

    app.route('/tipoAtividade/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.tipoAtividade.getById)
        .put(app.api.tipoAtividade.save)
        .delete(app.api.tipoAtividade.remove)
    
    app.route('/getAll/tipoAtividade')
        .all(app.config.passport.authenticate())
        .get(app.api.tipoAtividade.getAll)
        
    app.route('/funcao')
        .all(app.config.passport.authenticate())
        .get(app.api.funcao.get)
        .post(app.api.funcao.save)

    app.route('/funcao/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.funcao.getById)
        .put(app.api.funcao.save)
        .delete(app.api.funcao.remove)

    app.route('/getAll/funcao')
        .all(app.config.passport.authenticate())
        .get(app.api.funcao.getAll)

    app.route('/headerTableHourReport')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.tipoAtividade.headerTableHourReport))

    app.route('/atividade')
        .all(app.config.passport.authenticate())
        .get(app.api.atividade.get)
        .post(app.api.atividade.save)

    app.route('/atividade/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.atividade.getById)
        .put(app.api.atividade.save)
        .delete(app.api.atividade.remove)

    app.route('/atividades/search/:page/:idUsuario/:tarefa/:descricao/:idTipoAtividade/:dataDe/:dataAte')
        .all(app.config.passport.authenticate())
        .get(app.api.atividade.search)

    
    app.route('/dashboard/user/:idUsuario/:dataDe/:dataAte')
        .all(app.config.passport.authenticate())
        .get(app.api.dashboard.searchHoursByActivityType)

    app.route('/colaborators-chart/:dateFrom/:dateUntil')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.colaboratorsChart.getColaboratorsHourPerActivityType))
}