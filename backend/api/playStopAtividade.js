module.exports = app => {
    const { existsOrError, objectContainsIdOrErro, validateHourStartEnd, validateTask } = app.api.validation

    const save = async (req, res) => {
        const playStopAtividade = { ...req.body }

        if (req.params.id) {
            playStopAtividade.id = req.params.id
        }

        try {
            existsOrError(playStopAtividade.idUsuario, 'Usuário não informado')
            objectContainsIdOrErro(playStopAtividade.tipoAtividade, 'Tipo Atividade não informada')
            existsOrError(playStopAtividade.horaInicio, 'Hora início não informada')
            validateHourStartEnd(playStopAtividade.horaInicio, playStopAtividade.horaFim, "A hora de Início não pode ser maior que a hora Fim")
            validateTask(playStopAtividade.tarefa, "O número informado no campo Task é inválido")
            existsOrError(playStopAtividade.descricao, 'Descrição não informada')
            existsOrError(playStopAtividade.data, 'Data não informada')

            playStopAtividade.idTipoAtividade = playStopAtividade.tipoAtividade.id
            delete playStopAtividade.tipoAtividade

            if (playStopAtividade.tarefa === "") {
                playStopAtividade.tarefa = null
            }

            const playStopAtividadeFromDB = await app.db('playStopAtividade')
                .where({ data: playStopAtividade.data, idUsuario: playStopAtividade.idUsuario })
                .where(function () {
                    this
                        .where({ horaInicio:  playStopAtividade.horaInicio})
                        .orWhere({ horaFim: playStopAtividade.horaFim })
                })
                .first()
            if(!playStopAtividade.id) {
                notExistsOrError(playStopAtividadeFromDB, 'Hora Início/Fim já foi registrada em outra atividade')
            }

        } catch (msg) {
            return res.status(400).send(msg)
        }

        playStopAtividade.duracao = getDuracao(playStopAtividade);

        if (playStopAtividade.id && !playStopAtividade.horaFim) {
            app.db('playStopAtividade')
                .update(playStopAtividade)
                .where({ id: playStopAtividade.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else if (playStopAtividade.id && playStopAtividade.horaFim) {
            app.db.transaction(trx => {
                return app.db('playStopAtividade')
                .update(playStopAtividade)
                .where({ id: playStopAtividade.id })
                .then(() => {
                    delete playStopAtividade.id
                    return app.db('atividade').insert(playStopAtividade)
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err));
        } else {
            app.db('playStopAtividade')
                .insert(playStopAtividade)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const getDuracao = (atividade) => {
        let duracao = 0

        if (atividade.horaInicio !== "" && atividade.horaFim !== "") {
            const horaInicio = parseInt(atividade.horaInicio.split(':')[0])
            const minInicio = parseInt(atividade.horaInicio.split(':')[1])
            const horaFim = parseInt(atividade.horaFim.split(':')[0])
            const minFim = parseInt(atividade.horaFim.split(':')[1])
            const horaDiferanca = (horaFim - horaInicio) * 60
            const minDiferanca = minFim - minInicio

            duracao = horaDiferanca + minDiferanca
        }

       return duracao
    }

    return { save }
}
