// //    Utilities

const moment = require('moment');
const dbUtils = require('./main/dbms/db-utils');

const db = require('./main/dbms/init-db');

const { getSimulations } = db;

const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);

const currentTime = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

const config = require('./config');

const {
  saltPath: { data },
} = config;

const getConfigFilePath = simulationId => `${data}/${simulationId}/salt.config.json`;
const getScenarioFilePath = simulationId => `${data}/${simulationId}/salt.scenario.json`;

module.exports = {
  getSimulations,
  updatetStatus,
  currentTime,
  getConfigFilePath,
  getScenarioFilePath,
  config,
};
