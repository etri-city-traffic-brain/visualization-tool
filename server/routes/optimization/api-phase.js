const createError = require('http-errors')

const read = require('../../main/signal-optimization/read-phase')
const { getSimulation } = require('../../globals');

module.exports = async (req, res, next) => {
  const { id, type } = req.query;

  const sim = await getSimulation(id)

  if(!sim) {
    createError(404, 'cannot find optimization')
    return
  }

  // const simulationId = type === 'fixed' ? id : sim.masterId
  // const simulationId = id
  const simulationId = sim.masterId


  // phase 는 master directory 에 생성된다.

  console.log('read phase:', id, type)
  try {
    res.send(await read(simulationId, type))
  } catch (err) {
    console.log(err.message)
    next(err)
  }
}
