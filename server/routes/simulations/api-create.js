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
const downloadScenario = require('./utils/prepare-scenario');
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
  const { id, configuration } = body;
  debug(`prepare simulation ${id}`);

  if (existSimulation(id)) {
    next(createError(409, `Simulation [${id}] already exists...`));
    return;
  }
  const simulationDir = `${base}/data/${id}`;
  try {
    await mkdir(simulationDir);
    await registorSimulation(body, getSimulations(), currentTimeFormatted());
    updateStatus(id, 'preparing', {});
    await writeFile(`${simulationDir}/salt.scenario.json`, stringify(makeScenario({host, ...body})));
    // await downloadScenario(simulationDir, configuration );
    updateStatus(id, 'ready', {});
    debug(`simulation ${id} is ready!`)
    res.json({ id });
  } catch (err) {
    debug(err);
    updateStatus(id, 'error', {
      error: `fail to create simulation ${err.message}`,
      ended: currentTimeFormatted(),
    });
    next(createError(500, err.message))
  }
};
