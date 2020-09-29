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
const unzip = util.promisify(require('extract-zip'));
const createError = require('http-errors');

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

const makeScenario = require('../../main/simulation-manager/make-scenario');
const makeSaltConfig = require('../../main/simulation-manager/make-salt-config');
const { downloadScenarioByRegion } = require('../../main/service/scenario-downloader');

// const { ERROR } = require('../../main/simulation-manager/simulatoin-status');
const cloudService = require('../../main/service/cloud-service');
const prepareScenarioFile = require('./utils/prepare-scenario');

const createSimulation = require('./utils/create-simulation-row');

const {
  updatetStatus, currentTime, getSimulations, config,
} = require('../../globals');

const { base } = config;

const existSimulation = id => getSimulations().find({ id }).value();
const stringify = obj => JSON.stringify(obj, false, 2);

async function prepareScenario(simulationDir, { id: simulationId, configuration }) {
  const route = configuration.routes.map(route => `../routes/${route}`).join(' ');
  await writeFile(
    `${simulationDir}/salt.scenario.json`,
    stringify(makeScenario(Object.assign({}, configuration, { id: simulationId, route }))),
  );
}

async function prepareSaltConfig(simulationDir) {
  await writeFile(
    `${simulationDir}/salt.config.json`,
    stringify(makeSaltConfig(cloudService.getVmInfo())),
  );
}

/**
 * prepare simulation data
 */
module.exports = async (req, res, next) => {
  debug('create simulation');
  const { id: simulationId } = req.body;

  if (existSimulation(simulationId)) {
    next(createError(409, `Simulation [${simulationId}] already exists...`));
    return;
  }
  const simulationDir = `${base}/data/${simulationId}`;
  try {
    await mkdir(simulationDir);
    await createSimulation(req.body, getSimulations(), currentTime());
    updatetStatus(simulationId, 'preparing', {});

    await prepareScenario(simulationDir, req.body);
    await prepareSaltConfig(simulationDir, simulationId);

    updatetStatus(simulationId, 'downloading scenario...', {});

    // const scenarioFilePath = await prepareScenarioFile(
    //   simulationDir,
    //   req.body.configuration,
    //   downloadScenarioByRegion,
    // );
    // await unzip(scenarioFilePath, { dir: simulationDir });
    setTimeout(() => {
      updatetStatus(simulationId, 'ready', {});
      res.json({ simulationId });
    }, 10000);
  } catch (err) {
    debug(err);
    updatetStatus(simulationId, 'error', {
      error: `fail to create simulation ${err.message}`,
      ended: currentTime(),
    });
  }
};
