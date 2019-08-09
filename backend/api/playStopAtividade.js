module.exports = app => {
    const { existsOrError, objectContainsIdOrErro, validateTask, notExistsOrError} = app.api.validation

    const save = async (req, res) => {
        const playStopAtividade = { ...req.body }

        if (req.params.id) {
            playStopAtividade.id = req.params.id
        }

        try {
            existsOrError(playStopAtividade.idUsuario, 'Usuário não informado')
            objectContainsIdOrErro(playStopAtividade.tipoAtividade, 'Tipo Atividade não informada')
            existsOrError(playStopAtividade.horaInicio, 'Hora início não informada')
            validateTask(playStopAtividade.tarefa, "O número informado no campo Task é inválido")
            existsOrError(playStopAtividade.descricao, 'Descrição não informada')
            existsOrError(playStopAtividade.data, 'Data não informada')

            playStopAtividade.idTipoAtividade = playStopAtividade.tipoAtividade.id
            delete playStopAtividade.tipoAtividade

            if (playStopAtividade.tarefa === "") {
                playStopAtividade.tarefa = null
            }

            if (playStopAtividade.horaFim) {
                const playStopAtividadeFromDB = await app.db('playStopAtividade')
                    .where({ data: playStopAtividade.data, idUsuario: playStopAtividade.idUsuario })
                    .where(function () {
                        this
                            .where({ horaInicio: playStopAtividade.horaInicio})
                            .orWhere({ horaFim: playStopAtividade.horaFim })
                    })
                    .first()

                    if(!playStopAtividade.id) {
                        notExistsOrError(playStopAtividadeFromDB, 'Hora Início/Fim já foi registrada em outra atividade')
                    }
            }

        } catch (msg) {
            return res.status(400).send(msg)
        }

        playStopAtividade.duracao =  playStopAtividade.horaFim ? getDuracao(playStopAtividade) : 0;

        if (playStopAtividade.id && !playStopAtividade.horaFim) {
            app.db('playStopAtividade')
                .update(playStopAtividade)
                .where({ id: playStopAtividade.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else if (playStopAtividade.id && playStopAtividade.horaFim) {
            app.db.transaction(trx => {
                return app.db('playStopAtividade')
                    .transacting(trx)
                    .update(playStopAtividade)
                    .where({ id: playStopAtividade.id })
                    .then(() => {return validateInsertAtividade(playStopAtividade, res)})
                    .catch(msg => res.status(400).send(msg))
                    .then(trx.commit)
                    .catch(trx.rollback)
                })
            .then(_ => res.status(204).send())
            .catch(msg => res.status(400).send(msg));
        } else {
            app.db('playStopAtividade')
                .insert(playStopAtividade)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    validateInsertAtividade = async (atividade, res) => {

        if (atividade.id) {
            delete atividade.id
        }

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

        app.db('atividade')
            .insert(atividade)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const getDuracao = (atividade) => {
        let duracao = 0

        if (atividade.horaInicio !== "" && atividade.horaFim !== "") {
            const horaInicio = parseInt(atividade.horaInicio.split(':')[0])
            const minInicio = parseInt(atividade.horaInicio.split(':')[1])
            const horaFim =  parseInt(atividade.horaFim.split(':')[0])
            const minFim = parseInt(atividade.horaFim.split(':')[1])
            const horaDiferanca = (horaFim - horaInicio) * 60
            const minDiferanca = minFim - minInicio

            duracao = horaDiferanca + minDiferanca
        }

       return duracao
    }

    return { save }
}
