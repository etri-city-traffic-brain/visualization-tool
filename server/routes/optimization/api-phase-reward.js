
const createError = require('http-errors')

const read = require('../../main/signal-optimization/read-phase-reward')

module.exports = async (req, res, next) => {
  const { id, type } = req.query

  if (!id) {
    next(createError(400, 'id is missed'))
    return
  }

  if (!type) {
    next(createError(400, 'type[ft or rl] is missed'))
    return
  }

  const simulationId = id

  try {
    res.send(await read(simulationId, type))
  } catch (err) {
    next(createError(500, `cannot find reward file for ${simulationId}`))
  }
}
