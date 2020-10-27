

const cookSimulationResult = require('../../main/simulation-manager/simulation-result-cooker');
// const dbUtils = require('../../main/dbms/db-utils');

const { updatetStatus } = require('../../globals');

// const { FINISHED } = require('../../main/simulation-manager/simulatoin-status');

// const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);

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
    updatetStatus(id, status, { text });
    return;
  }

  try {
    updatetStatus(id, '처리중...');
    await cookSimulationResult({
      id,
      duration: configuration.end,
      period: configuration.period,
    }, (status, text) => {
      updatetStatus(id, status, text);
    });
  } catch (err) {
    console.log(err.message)
    updatetStatus(id, 'error', { error: err.message });
  }
};
