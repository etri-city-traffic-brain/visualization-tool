/**
 * Register simulation
 *
 * author: yeonheon Gu
 * last modified: 2019-6-5
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
const extractZip = util.promisify(require('extract-zip'));
const createError = require('http-errors');

const mkDir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

const makeScenario = require('../../main/make-scenario');
const makeSaltConfig = require('../../main/make-salt-config');
const { downloadScenarioByRegion } = require('../../main/service/scenario-downloader');
// const buildConfigDistributer = require('../../main/uploader-scp');

const { updatetStatus, currentTime } = require('./globals');
const { ERROR } = require('../../main/status');
const cloudService = require('../../main/service/cloud-service');
const db = require('../../main/dbms/db');

const { getSimulations } = db;
const {
  config: { base },
} = global.SALT;

const existSimulation = id => getSimulations().find({ id }).value();
const stringify = obj => JSON.stringify(obj, false, 2);

async function addRow(id, user, description, configuration) {
  await getSimulations()
    .push({
      id,
      user,
      description,
      status: 'preparing',
      created: currentTime(),
      configuration,
    })
    .write();
}

async function downloadScenarioFile(targetDir, configuration) {
  const {
    fromDate, fromTime, toDate, toTime, partitions, region,
  } = configuration;
  const refineDate = text => text.replace(/-/g, '');
  const refineTime = text => text.replace(/:/g, '');
  const file = await downloadScenarioByRegion({
    include: 0,
    fromDate: refineDate(fromDate),
    toDate: refineDate(toDate),
    fromTime: refineTime(fromTime),
    toTime: refineTime(toTime),
    region,
    subregion: 0,
    partitions,
    signal: 1,
    route: 1,
    event: 1,
    weather: 1,
  }, targetDir);
  await extractZip(file, { dir: targetDir });
}

/**
 * prepare simulation data
 */
module.exports = async function create(req, res, next) {
  const {
    id,
    user,
    description,
    configuration,
  } = req.body;

  const {
    period, partitions, begin, end, routes,
  } = configuration;

  if (!user) {
    next(createError(400, 'user id missed'));
    return;
  }

  if (existSimulation(id)) {
    next(createError(409, `Simulation [${id}] already exists...`));
    return;
  }

  res.json({
    simulationId: id,
    msg: 'trying to create simulation...',
  });

  const route = routes.map(route => `../routes/${route}`).join(' ');
  const saltScenario = makeScenario({
    id,
    begin,
    end,
    period,
    partitions,
    route,
  });

  const simulationDir = `${base}/data/${id}`;
  const scenarioFile = `${simulationDir}/salt.scenario.json`;
  const configFile = `${simulationDir}/salt.config.json`;
  try {
    await mkDir(simulationDir);
    await addRow(id, user, description, configuration);
    updatetStatus(id, 'preparing', {});

    const vmInfo = cloudService.getVmInfo();
    await writeFile(`${scenarioFile}`, stringify(saltScenario));
    await writeFile(`${configFile}`, stringify(makeSaltConfig(vmInfo)));

    await downloadScenarioFile(simulationDir, configuration);
    updatetStatus(id, 'ready', {});
  } catch (err) {
    debug(err);
    updatetStatus(id, ERROR, {
      error: `fail to prepare simulation ${err.message}`,
      ended: currentTime(),
    });
  }
};
