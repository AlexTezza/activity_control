const Redmine = require('node-redmine');

module.exports = app => {
    const INSERT = 'insert';
    const REPLACE = 'replace';
    const UPDATE = 'update';
    const REMOVE = 'remove';
    const ERROR = 'error';

    /**
     *
     * @param {*} req
     * @param {*} res
     */
    const syncByOperation = async(req, res) => {
        const atividade = { ...req.body }
        const {operation} = req.params;

        switch(operation) {
            case INSERT:
                return await insertSync(atividade, res);
            case UPDATE:
                return await updateSync(atividade, res);
            case REPLACE:
                return await replaceSync(atividade, res);
            case REMOVE:
                return await removeSync(atividade, res);
            default:
                break;
        }
    }

    /**
     * Remove o registro da atividade no Redmine
     *
     * @param {Atividade} atividade
     * @param {Response} res
     */
    const removeSync = async(atividade, res) => {
        const {redmineTaskId, idUsuario} = atividade;
        const redmine = await getRedmineApiInstance(idUsuario);

        return redmine.delete_time_entry(redmineTaskId, (error, data) => {
            if (error) {
                return res.status(200).send(getRedmineErrorMessage(error));
            }
            clearSyncPendency(atividade);
            return res.status(200).send();
        });
    }

    /**
     * Insere o registro da atividade no Redmine
     *
     * @param {Atividade} atividade
     * @param {Response} res
     */
    const insertSync = async(atividade, res) => {
        const {id: idAtividade, idUsuario} = atividade;
        const {redmineId} = await getRedmineUserData(idUsuario);
        const redmine = await getRedmineApiInstance(idUsuario);
        const time_entry = await getTimeEntry(atividade, redmineId);

        return redmine.create_time_entry(time_entry, (createError, data) => {
            if (createError) {
                return res.status(500).send(getRedmineErrorMessage(createError));
            }
            clearSyncPendency(atividade);
            return updateRedmineTaskId(data.time_entry.id, idAtividade, res);
        });
    }

    /**
     * Atualiza o registro da atividade no Redmine
     *
     * @param {Atividade} atividade
     * @param {Response} res
     */
    const updateSync = async(atividade, res) => {
        const {idUsuario, redmineTaskId} = atividade;
        const {redmineId} = await getRedmineUserData(idUsuario);
        const redmine = await getRedmineApiInstance(idUsuario);
        const time_entry = await getTimeEntry(atividade, redmineId);

        return redmine.update_time_entry(redmineTaskId, time_entry, (updateError, data) => {
            if (updateError) {
                return res.status(500).send(getRedmineErrorMessage(updateError));
            }
            clearSyncPendency(atividade);
            return res.status(201).send();
        });

    }

    /**
     * Realoca o registro da atividade no Redmine para outra tarefa
     *
     * @param {Atividade} atividade
     * @param {Response} res
     */
    const replaceSync = async(atividade, res) => {
        const {id: idAtividade, idUsuario, redmineTaskId} = atividade;
        const {redmineId} = await getRedmineUserData(idUsuario);
        const redmine = await getRedmineApiInstance(idUsuario);
        const time_entry = await getTimeEntry(atividade, redmineId);

        return redmine.delete_time_entry(redmineTaskId, (removeError, data) => {
            if (removeError) {
                return res.status(500).send(getRedmineErrorMessage(removeError));
            }
            return redmine.create_time_entry(time_entry, (createError, data) => {
                if (createError) {
                    return res.status(500).send(getRedmineErrorMessage(createError));
                }
                clearSyncPendency(atividade);
                return updateRedmineTaskId(data.time_entry.id, idAtividade, res);
            });
        });
    }

    /**
     * Função utilizada para sincronização automática das atividades com o Redmine
     * ao fazer operações de inserção, atualização e deleção de uma atividade localmente.
     *
     * A função identifica qual ação de sincronização deve ser realizada (INSERT, UPDATE, REPLACE, REMOVE)
     *
     * @param {Atividade} oldAtividade
     * @param {Atividade} atividade
     * @param {Response} res
     */
    const generalSync = async (oldAtividade, atividade, res) => {
        const action = getSyncAction(oldAtividade, atividade);
        const {id: idAtividade, idUsuario, redmineTaskId, tarefa} = atividade;

        if (!action) {
            if  (!tarefa) {
                return await setRedmineSyncPendency(idAtividade, action, res)
            }
            return res.status(201).send();
        }

        const {redmineId, redmineAllowSync} = await getRedmineUserData(idUsuario);

        if (!redmineAllowSync) {
            return await setRedmineSyncPendency(idAtividade, action, res)
        }

        const redmine = await getRedmineApiInstance(idUsuario);
        const time_entry = await getTimeEntry(atividade, redmineId);

        switch(action) {
            case INSERT:
                return redmine.create_time_entry(time_entry, (createError, data) => {
                    if (createError) {
                        return res.status(200).send(getRedmineErrorMessage(createError));
                    }
                    return updateRedmineTaskId(data.time_entry.id, idAtividade, res);
                });

            case REPLACE:
                return redmine.delete_time_entry(redmineTaskId, (removeError, data) => {
                    if (removeError) {
                        return res.status(500).send(getRedmineErrorMessage(removeError));
                    }
                    return redmine.create_time_entry(time_entry, (createError, data) => {
                        if (createError) {
                            return res.status(500).send(getRedmineErrorMessage(createError));
                        }

                        return updateRedmineTaskId(data.time_entry.id, idAtividade, res);
                    });
                });

            case UPDATE:
                return redmine.update_time_entry(redmineTaskId, time_entry, (updateError, data) => {
                    if (updateError) {
                        return res.status(500).send(getRedmineErrorMessage(updateError));
                    }
                    return res.status(201).send();
                });

            case REMOVE:
                return redmine.delete_time_entry(redmineTaskId, (removeError, data) => {
                    if (removeError) {
                        return res.status(500).send(getRedmineErrorMessage(removeError));
                    }

                    return updateRedmineTaskId(null, idAtividade, res);
                });

            default:
                return res.status(500).send('Erro inesperado!');
        }
    }

    getRedmineUserData = async (idUsuario) => {
        return await app.db('usuario')
            .select('redmineApiKey','redmineId','redmineAllowSync')
            .where({id: idUsuario})
            .first()
            .then(response => {
                return {
                    redmineId: response.redmineId,
                    redmineApiKey: response.redmineApiKey,
                    redmineAllowSync: response.redmineAllowSync,
                };
            })
            .catch(error => {
                console.log(error);
            })
    }

    /**
     * Identifica qual ação de sincronização deve ser tomada.
     * Função utilizada durante o modo de sincronização automática
     *
     * @param {Atividade} oldAtividade
     * @param {Atividade} atividade
     * @param {Response} res
     */
    getSyncAction = (oldAtividade, atividade) => {
        const {tarefa: oldTarefa, redmineTaskId: oldRedmineTaskId} = oldAtividade || {};
        const {tarefa, redmineTaskId, redmineSyncPendency} = atividade;

        if (tarefa && redmineSyncPendency === REPLACE) {
            return REPLACE;
        }
        if (!oldAtividade) {
            if (tarefa) {
                return INSERT;
            } else {
                return null;
            }
        } else {
            if (!oldTarefa && tarefa && redmineSyncPendency === REMOVE) {
                return REPLACE;
            }
            if (!oldTarefa && tarefa && !redmineTaskId) {
                return INSERT;
            }
            if (oldTarefa && !tarefa && redmineTaskId) {
                return REMOVE;
            }
            if (!oldTarefa && !tarefa) {
                return null;
            }
            if (oldTarefa && tarefa && oldTarefa !== tarefa && !redmineTaskId) {
                return INSERT;
            }
            if (oldTarefa && tarefa && oldTarefa !== tarefa) {
                return REPLACE;
            }
            if (oldTarefa && tarefa && oldTarefa === tarefa) {
                return UPDATE;
            }
            if (oldTarefa && !tarefa && !redmineTaskId) {
                return null;
            }
            if (oldTarefa && !tarefa) {
                return REMOVE;
            }
            return ERROR;
        }
    }

    getRedmineActivityId = (idTipoAtividade, redmineId) => {
        return app.db('redmineActivities')
            .select('activityExternalId')
            .join('redmineActivities_tipoAtividade', 'redmineActivities_tipoAtividade.redmineActivitiesId', 'redmineActivities.id')
            .whereRaw(`"redmineActivities"."redmineId" = ${redmineId} AND "redmineActivities_tipoAtividade"."tipoAtividadeId" = ${idTipoAtividade}`)
            .first()
            .then(res => res.activityExternalId)
            .catch(error => {
                console.log(error);
            });
    }

    getRedmineApiInstance = async (idUsuario) => {
        const {redmineId, redmineApiKey} = await getRedmineUserData(idUsuario);

        const {url} = await app.db('redmine')
            .select('url')
            .where({id: redmineId})
            .first()
            .catch(error => {
                console.log(error);
            });

        return new Redmine(url, {apiKey: redmineApiKey})
    }

    setRedmineSyncPendency = async (idAtividade, redmineSyncPendency, res) => {
        return await app.db('atividade')
            .update({redmineSyncPendency})
            .where({id: idAtividade})
            .then(() => {
                return res && res.status(201).send()
            })
            .catch(error => {
                console.log(error);
                return res && res.status(500).send(error);
            });
    }

    getTimeEntry = async (atividade, redmineId) => {
        const idTipoAtividade = atividade.idTipoAtividade || atividade.tipoAtividade.id;
        const activity_id = await getRedmineActivityId(idTipoAtividade, redmineId);

        return {
            time_entry: {
                issue_id: atividade.tarefa,
                spent_on: atividade.data.substr(0,10),
                activity_id,
                comments: atividade.descricao,
                hours: atividade.duracao / 60
            }
        };
    }

    updateRedmineTaskId = (redmineTaskId, idAtividade, res) => {
        return app.db('atividade')
            .update({redmineTaskId})
            .where({id: idAtividade})
            .then(res.status(201).send())
            .catch(error => {
                console.log(error);
                return res && res.status(500).send(error);
            });
    }

    clearSyncPendency = (atividade) => {
        if (atividade.redmineSyncPendency) {
            setRedmineSyncPendency(atividade.id, null);
        }
    }

    getRedmineErrorMessage = (error) => {
        try {
            const errorObject = JSON.parse(error);
            const message = errorObject.Message;

            console.log(message);

            if (message.indexOf('Not Found') >= 0) {
                return 'Registro excluído com sucesso mas não foi encontrado no Redmine';
            }

            if (message.indexOf('Unprocessable Entity') >= 0) {
                if (errorObject.Detail.errors.indexOf('Tarefa não é válido') >= 0) {
                    return 'Task do Redmine inválida!';
                }
            }

            return message;
        } catch(e) {
            console.log(error);
            return error;
        }
    }

    return { syncByOperation, generalSync, removeSync }
}
