

const cloudService = require('../../main/service/cloud-service');
const downloader = require('../../main/simulation-manager/downloader');
const cookSimulationResult = require('../../main/simulation-manager/cook');
const Status = require('../../main/simulation-manager/simulatoin-status');

const { FINISHED } = Status;
const {
  db: { getSimulations },
  config: {
    saltPath: { output },
  },
} = global.SALT;

const { updateStatus } = require('../../globals');

const downloadFiles = require('./download-files');

const makeResultDownloader = ({ pathLocal, pathRemote, vmInfo }) => async (simulationId) => {
  await downloader.mkdir(pathLocal, simulationId);
  return downloadFiles({
    pathLocal,
    pathRemote,
    simulationId,
    vmInfo,
  });
};

/**
 * handle simulation status event
 * this function will taken long time
 * @param {object} simulation
 * @param {*} status
 * @param {*} text
 */
async function handle({ simulation, status, text = '' }) {
  let vmInfo = null;
  try {
    vmInfo = await cloudService.getVmInfo(simulation.user);
  } catch (err) {
    updateStatus(simulation.id, 'error', {
      error: `Fail to retrieve VM package info - ${err.message}`,
    });
    return;
  }

  const download = makeResultDownloader({
    pathLocal: output,
    pathRemote: output,
    vmInfo,
  });

  if (status === FINISHED) {
    try {
      updateStatus(simulation.id, 'downloading');
      await download(simulation.id);
      updateStatus(simulation.id, 'analyzing');
      cookSimulationResult({
        simulationId: simulation.id,
        duration: simulation.configuration.end,
        period: simulation.configuration.period,
      })
    } catch (err) {
      updateStatus(simulation.id, 'error', { error: err.message });
    }
  } else {
    updateStatus(simulation.id, status, { text });
  }
}

module.exports = handle;
