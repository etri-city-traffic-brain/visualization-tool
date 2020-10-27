// //    Utilities

const moment = require('moment');

const simulationStatusUpdater = lowDbTable => (id, status, param = {}) => {
  lowDbTable().find({ id })
    .assign({
      status,
      ...param,
    })
    .write();
}

const db = require('./main/dbms/init-db');
const config = require('./config');

const { getSimulations } = db;

const updateStatus = simulationStatusUpdater(getSimulations);

const currentTimeFormatted = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

const getConfigFilePath = simulationId => `${config.saltPath.data}/${simulationId}/salt.config.json`;
const getScenarioFilePath = simulationId => `${config.saltPath.data}/${simulationId}/salt.scenario.json`;

const getSimulation = id => getSimulations().find({ id }).value()

module.exports = {
  getSimulations,
  updateStatus,
  currentTimeFormatted,
  getConfigFilePath,
  getScenarioFilePath,
  getSimulation,
  config,
};
