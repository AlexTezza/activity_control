const app = require('express')()
const consign = require('consign')
const db = require('./config/db')
const { baseUrl } = require('./global/global')

app.db = db

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.listen(3000, baseUrl, () => {
    console.log('Backend executando...')
})