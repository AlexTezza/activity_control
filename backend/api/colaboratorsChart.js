module.exports = app => {
    const { existsOrError } = app.api.validation
    const { formatterMinutesToHours } = app.api.utils

    const getColaboratorsHourPerActivityType = async (req, res) => {

        existsOrError(req.params.dateFrom)
        existsOrError(req.params.dateUntil)

        let dateFrom = req.params.dateFrom
        let dateUntil = req.params.dateUntil

        let organizedResultData = await colaboratorHour(res, dateFrom, dateUntil)
        let rawHours = await totalHoursPerAcvitiesType(res, dateFrom, dateUntil)
        let optionsSeries = extractOptionsAndSeries(rawHours)
        let totals = returnTotalHoursObject(rawHours)
        let rawResultData = formatHourPerActivitiesType(rawHours)

        return res.json({ organizedResultData, rawResultData, totals, optionsSeries })
    }

    async function colaboratorHour(res, dateFrom, dateUntil) {
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
                        data between '${dateFrom}'
                        and '${dateUntil}'
                    group by
                        a."idUsuario",
                        a."idTipoAtividade"
                    ) foo
                inner join usuario u on u.id = foo.idUsuario
                inner join "tipoAtividade" ta on ta.id = foo.idTipoAtividade
            order by u.nome, ta.descricao
        `
        return await app.db.raw(query)
            .then(result => organizeData(result.rows))
            .catch(err => res.status(500).send(err))
    }

    async function totalHoursPerAcvitiesType(res, dateFrom, dateUntil) {
        let query = `
            select
                ta.descricao as description,
                sum(a.duracao) as total
            from
                atividade a
                inner join "tipoAtividade" ta on ta.id = a."idTipoAtividade"
                inner join usuario u on u.id = a."idUsuario"
            where
                data between '${dateFrom}'
                and '${dateUntil}'
            group by
                ta.descricao
            order by ta.descricao
        `
        return await app.db.raw(query)
            .then(result => result.rows)
            .catch(err => 
                res.status(500).send(err)
            )
    }

    function extractOptionsAndSeries(items) {
        let optionsArray = []
        let seriesArray = []
        items.map(item => {
            optionsArray.push(item.description)
            seriesArray.push(parseInt(item.total))
        })

        return {
            options: optionsArray,
            series: seriesArray
        }
    }

    function returnTotalHoursObject(items) {
        let totalMinutes = sumTotalHours(items)
        return {
            description: "Total de horas realizadas",
            totalHours: formatterMinutesToHours(totalMinutes),
            totalMinutes: totalMinutes
        }
    }

    function formatHourPerActivitiesType(items) {
        items.map(item => {
            item.total = formatterMinutesToHours(item.total)
        })
        return items
    }

    function sumTotalHours(items) {
        let total = 0
        items.map(item => {
            total += parseInt(item.total)
        })

        return total
    }

    function organizeData(data, minutesToHours = false) {
        let resultArray = []
        const users = getAllUsersFromData(data);

        users.forEach((value, key) => {
            let result = {}
            result.id = key
            result.name = value

            data.filter(item => {
                return item.idusuario == key
            }).map(item => {
                result[item.sigla] = formatterMinutesToHours(item.duracao)
            })

            resultArray.push(result)
        })

        return resultArray
    }

    function getAllUsersFromData(data) {
        let users = new Map();
        data.map(item => {
            users.set(item.idusuario, item.nome)
        })
        return users
    }

    return { getColaboratorsHourPerActivityType }
}