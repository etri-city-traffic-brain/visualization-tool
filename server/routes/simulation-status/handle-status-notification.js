

const cloudService = require('../../main/service/cloud-service');
const downloader = require('../../main/simulation-manager/downloader');
const cookSimulationResult = require('../../main/simulation-result-cooker');
const Status = require('../../main/status');

const { FINISHED } = Status;
const {
  db: { getSimulations },
  dbUtils,
  config: {
    saltPath: { output },
  },
} = global.SALT;

const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);
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
    updatetStatus(simulation.id, 'error', {
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
      updatetStatus(simulation.id, 'downloading');
      await download(simulation.id);
      updatetStatus(simulation.id, 'analyzing');
      cookSimulationResult({
        id: simulation.id,
        duration: simulation.configuration.end,
        period: simulation.configuration.period,
      }, (status, text) => {
        updatetStatus(simulation.id, status, text);
      });
    } catch (err) {
      updatetStatus(simulation.id, 'error', { error: err.message });
    }
  } else {
    updatetStatus(simulation.id, status, { text });
  }
}

module.exports = handle;
