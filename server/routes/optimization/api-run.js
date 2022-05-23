const debug = require('debug')('api')
const createError = require('http-errors')

const {
  updateStatus,
  currentTimeFormatted,
  getSimulation
} = require('../../globals')
const { executeOptimizer } = require('../../sim-runner')

module.exports = async (req, res, next) => {
  const { id, mode, modelNum } = req.query

  const simulation = getSimulation(id)

  if (simulation.status === 'running') {
    next(createError(400, `${id} is already running...`))
    return
  }

  if (!simulation) {
    next(createError(404, `${id}) is not found`))
    return
  }

  updateStatus(id, 'running', { started: currentTimeFormatted(), epoch: 0 })
  res.send({})
  executeOptimizer(simulation, mode, modelNum)
    .then(() => {
      updateStatus(id, 'finished', {
        started: currentTimeFormatted(),
        epoch: 0
      })
    })
    .catch(err => {
      debug(err)
      console.log('----->', err)
      updateStatus(id, 'stopped', {
        ended: currentTimeFormatted()
      })
    })
}
