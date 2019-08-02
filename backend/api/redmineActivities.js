const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const get = async (req, res) => {
        const {redmineId} = req.query;

        app.db('redmineActivities')
            .select('id', 'description')
            .where({redmineId})
            .then(rmActivities => {
                return res.json(rmActivities)
            })
            .catch(err => {
                res.status(500).send(err)
            })
    }

    return { get }
}
