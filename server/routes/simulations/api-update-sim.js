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

const writeFile = util.promisify(fs.writeFile);

const makeScenario = require('../../main/simulation-manager/make-scenario');
const registorSimulation = require('./utils/create-simulation-row');

const {
  updateStatus, currentTimeFormatted, getSimulations, config,
  getSimulation,
} = require('../../globals');

const { base, server } = config;




/**
 * prepare simulation data
 */
module.exports = async (req, res, next) => {
  const { body } = req
  const { id, type } = body;

};
