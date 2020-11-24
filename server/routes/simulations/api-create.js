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
const downloadScenarioTest = require('./utils/prepare-scenario-test');
const addSimulation = require('../../main/simulation-manager/crud/create');

const {
  updateStatus, currentTimeFormatted, getSimulations, config,
} = require('../../globals');

const { base, server } = config;
const host = server.ip
const existSimulation = id => getSimulations().find({ id }).value();
const stringify = obj => JSON.stringify(obj, false, 2);


const randomId = (num) => ('S-' + ((Math.random() * 10000000) + '').replace('.','')).substring(0, 14) + '-' + num

async function createScenarioFile (targetDir, { host, body, id}) {
  await writeFile(
    `${targetDir}/salt.scenario.json`,
    stringify(makeScenario({ host, ...body, id }))
  );
}

async function prepareSimulation(id, body, role, slaves = []) {
  const simInputDir = `${base}/data/${id}`;
  const simOutputDir = `${base}/output/${id}`;
  await mkdir(simInputDir);
  await mkdir(simOutputDir);
  await addSimulation({ ...body, id, slaves, role });
  await createScenarioFile(simInputDir, { host, body, id })

  if(body.configuration.region < 100) {
    await downloadScenarioTest(simInputDir, body.configuration );
  } else {
    await downloadScenario(simInputDir, body.configuration );
  }

  updateStatus(id, 'ready', {});
}

const ROLE = {
  TRAINING: 'training',
  TEST: 'test',
  FIXED: 'fixed',
  SIMULATION: 'simulation',
}

/**
 * prepare simulation data
 */
module.exports = async (req, res, next) => {
  const { body } = req
  const { id, type } = body;
  debug(`prepare simulation ${id}`);

  if (existSimulation(id)) {
    next(createError(409, `simulation [${id}] already exists...`));
    return;
  }

  try {
    if(type === 'optimization') {
      const idTest = randomId(0) // for test
      const idFixed = randomId(1) // for fixed
      await prepareSimulation(id, body, ROLE.TRAINING, [idTest, idFixed])
      body.masterId = id
      await prepareSimulation(idTest, body, ROLE.TEST, [])
      await prepareSimulation(idFixed, body, ROLE.FIXED, [])
    } else {
      await prepareSimulation(id, body, ROLE.SIMULATION)
    }
    debug(`simulation ${id} is ready!`)
    res.json({ id });
  } catch (err) {
    debug(err.message);
    updateStatus(id, 'error', {
      error: `fail to create simulation - ${err.message}`,
      ended: currentTimeFormatted(),
    });
    next(createError(500, err.message))
    return
  }
};
