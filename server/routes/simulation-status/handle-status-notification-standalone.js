

const cookSimulationResult = require('../../main/simulation-manager/simulation-result-cooker');
const dbUtils = require('../../main/dbms/db-utils');

const { getSimulations } = require('../../globals');

const { FINISHED } = require('../../main/simulation-manager/simulatoin-status');

const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);

/**
 * handle simulation status event
 * this function will taken long time
 * @param {object} simulation
 * @param {*} status
 * @param {*} text
 */

module.exports = async function processSimulationStatus({ simulation, status, text = '' }) {
  const { id, configuration } = simulation;
  if (status !== FINISHED) {
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
    updatetStatus(id, 'error', { error: err.message });
  }
};
