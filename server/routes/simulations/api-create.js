/**
 * Register simulation
 *
 * author: yeonheon Gu
 * last modified: 2020-9-24
 *
 * 0. getting simulation from UI
 * 1. create config.json file for SALT simulator
 * 2. download scenario (data.zip)
 * 3. extract data.zip to simulation data directory
 * 4. add simulation info to Database
 */

const debug = require('debug')('api:create');
const fs = require('fs');
const util = require('util');
const createError = require('http-errors');

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

const makeScenario = require('../../main/simulation-manager/make-scenario');
// const downloadScenario = require('./utils/prepare-scenario');
const downloadScenario = require('./utils/prepare-scenario-test');
const registorSimulation = require('./utils/create-simulation-row');

const {
  updateStatus, currentTimeFormatted, getSimulations, config,
} = require('../../globals');

const { base, server } = config;
const host = server.ip
const existSimulation = id => getSimulations().find({ id }).value();
const stringify = obj => JSON.stringify(obj, false, 2);




/**
 * prepare simulation data
 */
module.exports = async (req, res, next) => {
  const { body } = req
  const { id, type, configuration } = body;
  debug(`prepare simulation ${id}`);

  if (existSimulation(id)) {
    next(createError(409, `Simulation [${id}] already exists...`));
    return;
  }
  try {

    const randomId = (num) => ('S-' + ((Math.random() * 10000000) + '').replace('.','')).substring(0, 14) + '-' + num

    async function makeSimDir(id, body, role, slaves = []) {
      const simTrainDir = `${base}/data/${id}`;
      await mkdir(simTrainDir);
      await registorSimulation({ ...body, id, slaves , role }, getSimulations(), currentTimeFormatted());
      updateStatus(id, 'ready', {});
      await writeFile(`${simTrainDir}/salt.scenario.json`, stringify(makeScenario({ host, ...body, id })));
      await downloadScenario(simTrainDir, configuration );

    }

    if(type === 'optimization') {
      const simTrainDir = `${base}/data/${id}`;
      const simFixedId = randomId(0)
      const simTestId = randomId(1)
      const simFixedDir = `${base}/data/${simFixedId}`;
      const simTestDir = `${base}/data/${simTestId}`;

      await makeSimDir(id, body, 'training', [simFixedId, simTestId])
      await makeSimDir(simFixedId, body, 'fixed', [])
      await makeSimDir(simTestId, body, 'test', [])
      // await mkdir(simTrainDir);
      // await registorSimulation({ ...body, slaveId: simFixedId, role: 'master' }, getSimulations(), currentTimeFormatted());
      // updateStatus(id, 'ready', {});
      // await writeFile(`${simTrainDir}/salt.scenario.json`, stringify(makeScenario({host, ...body})));
      // await downloadScenario(simTrainDir, configuration );

      // await mkdir(simFixedDir);
      // await registorSimulation({ ...body, id: simFixedId, role: 'slave' }, getSimulations(), currentTimeFormatted());
      // updateStatus(simFixedId, 'ready', {});
      // await writeFile(`${simFixedDir}/salt.scenario.json`, stringify(makeScenario({host, ...body, id: simFixedId})));
      // await downloadScenario(simFixedDir, configuration );

      // await mkdir(simTestDir);
      // await registorSimulation({ ...body, id: simTestId, role: 'slave' }, getSimulations(), currentTimeFormatted());
      // updateStatus(simTestId, 'ready', {});
      // await writeFile(`${simTestDir}/salt.scenario.json`, stringify(makeScenario({host, ...body, id: simTestId})));
      // await downloadScenario(simTestDir, configuration );

    } else {
      const simulationDir = `${base}/data/${id}`;
      await mkdir(simulationDir);
      await registorSimulation({
        ...body,
        role: 'master',
        type: 'simulation'
      }, getSimulations(), currentTimeFormatted());
      updateStatus(id, 'preparing', {});
      await writeFile(`${simulationDir}/salt.scenario.json`, stringify(makeScenario({host, ...body})));
      await downloadScenario(simulationDir, configuration );

      updateStatus(id, 'ready', {});
    }
    debug(`simulation ${id} is ready!`)
    res.json({ id });
  } catch (err) {
    debug(err.message);
    updateStatus(id, 'error', {
      error: `fail to create simulation ${err.message}`,
      ended: currentTimeFormatted(),
    });
    next(createError(500, err.message))
  }
};
