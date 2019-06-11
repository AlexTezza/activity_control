module.exports = app => {
    const { existsOrError } = app.api.validation

    const getColaboratorsHourPerActivityType = async (req, res) => {

        existsOrError(req.params.dateFrom)
        existsOrError(req.params.dateUntil)

        let query = `
            select
                u.id as idUsuario,
                u.nome,
                ta.id as idTipoAtividade,
                ta.descricao,
                ta.sigla,
                foo.duracao
            from
                (
                select
                    a."idUsuario" as idUsuario,
                    a."idTipoAtividade" as idTipoAtividade,
                    sum(a.duracao) as duracao
                from
                    atividade a
                    inner join "tipoAtividade" ta on ta.id = a."idTipoAtividade"
                    inner join usuario u on u.id = a."idUsuario"
                where
                    data between '${req.params.dateFrom}'
                    and '${req.params.dateUntil}'
                group by
                    a."idUsuario",
                    a."idTipoAtividade"
                ) foo
                inner join usuario u on u.id = foo.idUsuario
                inner join "tipoAtividade" ta on ta.id = foo.idTipoAtividade
                order by u.nome, ta.descricao
        `
        await app.db.raw(query)
        .then(result => organizeData(result.rows))
        .then(result => res.json({ result: result.rows }))
        .catch(err => res.status(500).send(err))
    }

    function organizeData(data) {
        
        data.map(row => {
            console.log(row)
        })
    }

    return { getColaboratorsHourPerActivityType }
}