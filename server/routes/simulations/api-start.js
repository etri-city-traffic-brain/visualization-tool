const debug = require('debug')('api:create')
const moment = require('moment')
const {
  updateStatus,
  currentTimeFormatted,
  getSimulations
} = require('../../globals')
const { executeSimulation } = require('../../sim-runner')

const getSimulation = id => getSimulations().find({ id }).value()

/**
 * Start a simulation
 */
async function start (req, res) {
  const { id } = req.query
  const simulation = getSimulation(id)

  debug('start simulation', id)

  if (!simulation) {
    res.status(404).send({
      error: `Simulation(${id}) not exists...`
    })
    return
  }
  try {
    res.json({ id, status: 'running', result: '' })
    updateStatus(id, 'running', { started: currentTimeFormatted(), error: '' })
    executeSimulation(simulation).catch(err => {
      console.log(err.message)
      updateStatus(id, 'error', {
        error: `fail to start simulation ${err.message.slice(0, 300)}`,
        ended: currentTimeFormatted()
      })
    })
  } catch (err) {
    updateStatus(id, 'error', {
      error: `fail to start simulation ${err.message}`,
      ended: currentTimeFormatted()
    })
    res.status(500).json({ id, status: 'error', error: err.message })
  }
}

module.exports = start
