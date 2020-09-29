
/**
 * Run simulator API
 *
 * 1. upload simulation data files to remote servers(master and workers)
 * 1.1 datafile include scenario and config.json
 * 2. make ssh connection to Master simulator
 * 3. run python script
 * 4. update DB
 * 5. simulation status will be updated after some time later
 * 5.1 simulator must send its status
 *
 */
const debug = require('debug')('api:create');

// const { RUNNING, ERROR } = require('../../main/simulation-manager/simulatoin-status');
const { updatetStatus, currentTime, getSimulations } = require('../../globals');

// const runSimulator = require('../../main/simulation-manager/simulation-runner');
const run = require('../../main/simulation-manager/simulation-runner-standalone');
// const makeUpload = require('../../main/uploader-scp');
/**
 * upload data files to master and workers
 * from: local simulation directory
 *  ex) /home/ubuntu/salt/data/{simulation}
 * to: remote simulation directory
 *  ex) /home/ubuntu/salt/data/{simulation}
 * @param {String} simulationId
 * @param {VmInfo} vmInfo
 */

const getSimulation = id => getSimulations().find({ id }).value();

/**
 * Start a simulation
 */
async function start(req, res) {
  const { id } = req.query;
  const simulation = getSimulation(id);

  debug('start simulation', id);

  if (!simulation) {
    res.status(404).send({
      error: `Simulation(${id}) not exists...`,
    });
    return;
  }

  try {
    res.json({ id, status: 'running', result: '' });
    updatetStatus(id, 'running', { started: currentTime() });
    const result = await run({ simulationId: id });
  } catch (err) {
    updatetStatus(id, 'error', {
      error: `fail to start simulation ${err.message}`,
      ended: currentTime(),
    });
    res.status(500).json({ id, status: 'error', error: err.message });
  }
}

module.exports = start;
