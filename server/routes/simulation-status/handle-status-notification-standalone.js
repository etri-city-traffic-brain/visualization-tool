

const cookSimulationResult = require('../../main/simulation-manager/cook');

const { updateStatus } = require('../../globals');

/**
 * handle simulation status event
 * this function will taken long time
 * @param {object} simulation
 * @param {*} status
 * @param {*} text
 */

module.exports = async ({ simulation, status, text = '' }) => {
  console.log('status', status)
  const { id, configuration } = simulation;
  if (status !== 'finished') {
    updateStatus(id, status, { text });
    return;
  }



  try {
    updateStatus(id, '처리중...');
    await cookSimulationResult({
      simulationId: id,
      duration: configuration.end,
      period: configuration.period,
    });
  } catch (err) {
    console.log(err.message)
    updateStatus(id, 'error', { error: err.message });
  }
};
