
const express = require('express')
const favicon = require('express-favicon')
const path = require('path')
const morgan = require('morgan')

const app = express()
const PUBLIC = path.join(__dirname, 'public')
const VIEWS = path.join(__dirname, 'views')
const FAVICON = favicon(`${__dirname}/public/favicon.ico`)

const config = require('./config')
app.set('views', VIEWS)
app.set('view engine', 'ejs')

app.all('/*', require('./middleware/cors'))

app.use(FAVICON)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(PUBLIC))
console.log(config.base)
// app.use('/video', express.static(path.join(__dirname, '/video')))
app.use('/video', express.static(path.join(config.base, 'cctv')))

app.use('/', require('./routes/index'))
app.use('/salt/v1/map', require('./routes/map'))
app.use('/salt/v1/statistics', require('./routes/statistics/index'))
app.use('/salt/v1/junction/', require('./routes/junction'))
app.use('/salt/v1/signal/jsontoxml/', require('./routes/signal'))
app.use('/salt/v1/status', require('./routes/simulation-status'))

app.use('/salt/v1/simulation', require('./routes/simulation-result'))
app.use('/salt/v1/simulations', require('./routes/simulations'))

app.use('/salt/v1/optimization', require('./routes/optimization'))

app.use('/salt/v1/optenv', require('./routes/optenv'))
app.use('/salt/v1/vds', require('./routes/vds'))
app.use('/salt/v1/dashboard', require('./routes/dashboard'))

app.use('/salt/v1/cctv', require('./routes/cctv'))

app.use(require('./middleware/not-found'))
app.use(require('./middleware/server-error'))

module.exports = app
