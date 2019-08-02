module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const update = async (req, res) => {
        const {redmineId, redmineApiKey, redmineAllowSync} = req.body;
        const {id} = req.params;

        try {
            const usuarioFromDB = await app.db('usuario')
                .where({ id })
                .first();

            const usuarioAtualizado = {
                ...usuarioFromDB,
                redmineId,
                redmineApiKey,
                redmineAllowSync: !!redmineAllowSync,
            };

            app.db('usuario')
                .update(usuarioAtualizado)
                .where({ id })
                .then(() => res.status(204).send())
                .catch(err => res.status(500).send(err))

        } catch(msg) {
            return res.status(400).send(msg)
        }
    }

    return { update }
}
