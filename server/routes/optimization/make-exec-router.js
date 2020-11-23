const debug = require('debug')('api:optimization-train');
const createError = require('http-errors')

const { updateStatus, currentTimeFormatted, getSimulation } = require('../../globals');

module.exports = exec => async (req, res, next) => {

  const { id, mode, modelNum } = req.query;
  const simulation = getSimulation(id);

  if (!simulation) {
    next(createError(404, `${id}) is not found`));
    return;
  }

  updateStatus(
    id,
    'running',
    { started: currentTimeFormatted(), epoch: 0 }
  );

  exec(simulation, mode, modelNum)
    .then(() => res.send({}))
    .catch(err => {
      debug(err)
      updateStatus(id, 'error', {
        error: err.message,
        ended: currentTimeFormatted(),
      });
      next(createError(500, err.message))
    });
}
