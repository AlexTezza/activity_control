module.exports = app => {
    const { existsOrError } = app.api.validation

    const searchHoursByActivityType = async (req, res) => {

        existsOrError(req.params.idUsuario)
        existsOrError(req.params.dataDe)
        existsOrError(req.params.dataAte)

        let query = `
            select 
                ta.descricao as name, fn_min_to_hrs(cast (sum(a.duracao) as int)) as data, sum(a.duracao) as total
            from atividade a inner join "tipoAtividade" ta on a."idTipoAtividade" = ta.id
                where a."idUsuario" = ${req.params.idUsuario} 
                and a.data >= '${req.params.dataDe}' 
                and a.data <= '${req.params.dataAte}'
            group by ta.descricao
        `
        await app.db.raw(query)
        .then(result => res.json({ result: result.rows }))
        .catch(err => res.status(500).send(err))
    }

    return { searchHoursByActivityType }
}