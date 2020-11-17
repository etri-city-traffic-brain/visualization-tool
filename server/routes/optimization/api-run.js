const debug = require('debug')('api:optimization-train');
const createError = require('http-errors')

const { updateStatus, currentTimeFormatted, getSimulation } = require('../../globals');

module.exports = exec => async (req, res, next) => {

  const { id, mode, modelNum } = req.query;
  const simulation = getSimulation(id);

  if (!simulation) {
    next(createError(404, `Simulation(${id}) not exists...`))
    return;
  }

    updateStatus(id, 'running', { started: currentTimeFormatted() });
    exec(simulation, mode, modelNum)
    .then(() => {
      res.send({ id, status: 'running', result: '' });
    })
    .catch(err=>{
      debug(err)
      updateStatus(id, 'error', {
        error: `fail to start simulation ${err.message}`,
        ended: currentTimeFormatted(),
      });
      res.status(500).json({ id, status: 'error', error: err.message });
    });

}
