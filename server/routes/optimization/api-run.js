

const { updateStatus, currentTimeFormatted, getSimulation } = require('../../globals');

// const exec = require('../../sim-runner/exec-optimization')
// const executeOptimization = require('../../sim-runner/exec-optimization')
const { executeOptimization } = require('../../sim-runner')



module.exports = async (req, res, next) => {

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

  executeOptimization(simulation, mode, modelNum)
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
