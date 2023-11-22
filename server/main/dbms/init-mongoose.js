/* eslint-disable no-console */
const debug = require('debug')('server:db')
const chalk = require('chalk')
const mongoose = require('mongoose')

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

function start({ mongodbUrl, mongoOption }) {
  const { connection } = mongoose
  let lastReconnectAttempt // saves the timestamp of the last reconnect attempt

  const connectionError = () => mongoose.disconnect()
  const connectionDisconnected = () => {
    debug(chalk.red('MongoDB disconnected!'))
    const now = new Date().getTime()
    // check if the last reconnection attempt was too early
    if (lastReconnectAttempt && now - lastReconnectAttempt < 5000) {
      // if it does, delay the next attempt
      const delay = 5000 - (now - lastReconnectAttempt)
      debug(chalk.blue(`reconnecting to MongoDB in ${delay}mills`))
      setTimeout(() => {
        debug(chalk.blue('reconnecting to MongoDB'))
        lastReconnectAttempt = new Date().getTime()
        mongoose.connect(mongodbUrl, { server: { auto_reconnect: true } })
      }, delay)
    } else {
      debug(chalk.blue('reconnecting to MongoDB'))
      lastReconnectAttempt = now
      mongoose.connect(mongodbUrl, { server: { auto_reconnect: true } })
    }
  }

  connection.on('error', connectionError)
  connection.on('disconnected', connectionDisconnected)
  connection.on('close', () => {
    connection.removeAllListeners()
  })
  const connected = () => debug('MongoDB connected...')
  const error = err => debug(chalk.red(err.message))

  mongoose
    .connect(mongodbUrl, mongoOption)
    .then(connected)
    .catch(error)
}

module.exports = {
  start
}
