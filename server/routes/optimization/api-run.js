
const debug = require('debug')('api')
const createError = require('http-errors')

const { updateStatus, currentTimeFormatted, getSimulation } = require('../../globals')
const { runSignalOptimization } = require('../../sim-runner')

module.exports = async (req, res, next) => {
  console.log('execute api-run')

  const { id, mode, modelNum } = req.query
  const simulation = getSimulation(id)

  if (simulation.status === 'running') {
    next(createError(400, `${id} is already running...`))
    return
  }
  console.log(simulation)

  if (!simulation) {
    next(createError(404, `${id}) is not found`))
    return
  }

  updateStatus(id, 'running', { started: currentTimeFormatted(), epoch: 0 })

  runSignalOptimization(simulation, mode, modelNum)
    .then(() => res.send({}))
    .catch(err => {
      debug(err)
      updateStatus(id, 'error', { error: err.message, ended: currentTimeFormatted() })
      next(createError(500, err.message))
    })
}
