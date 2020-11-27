const createError = require('http-errors')
const read = require('../../main/signal-optimization/read-reward')
const { getSimulation } = require('../../globals');
module.exports = async (req, res, next) => {
  const { id, } = req.query;

  const sim = await getSimulation(id)
  const simulationId = sim.masterId
  try {
    res.send(await read(simulationId))
  } catch (err) {
    next(createError(500, `cannot find reward file for ${simulaitionId}`))
  }
}
