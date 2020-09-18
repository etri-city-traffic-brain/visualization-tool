

const cookSimulationResult = require('../../main/simulation-result-cooker');
const Status = require('../../main/status');
const dbUtils = require('../../main/dbms/db-utils');
const db = require('../../main/dbms/db');

const { getSimulations } = db;
const { FINISHED } = Status;
// const {
//   db: { getSimulations },
// } = global.SALT;

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
