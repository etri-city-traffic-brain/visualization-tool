
const createError = require('http-errors')

const read = require('../../main/signal-optimization/read-reward-total')

module.exports = async (req, res, next) => {
  const { id } = req.query

  if (!id) {
    next(createError(400, 'id is missed'))
    return
  }

  const simulationId = id

  try {
    res.send(await read(simulationId))
  } catch (err) {
    next(createError(500, `cannot find reward file for ${simulationId}`))
  }
}
