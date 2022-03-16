// //    Utilities

const moment = require('moment')

const simulationStatusUpdater = require('./main/simulation-manager/update-status')

const db = require('./main/dbms/init-db')
const config = require('./config')

const { getSimulations, getOptEnvs } = db

const updateStatus = simulationStatusUpdater(getSimulations)

const currentTimeFormatted = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

const getConfigFilePath = simulationId => `${config.saltPath.data}/${simulationId}/salt.config.json`
const getScenarioFilePath = simulationId => `${config.saltPath.data}/${simulationId}/salt.scenario.json`

const getSimulation = id => getSimulations().find({ id }).value()
const mongooseUtils = require('./main/dbms/mongo-utils')

module.exports = {
  getSimulations,
  getOptEnvs,
  updateStatus,
  currentTimeFormatted,
  getConfigFilePath,
  getScenarioFilePath,
  getSimulation,
  config,
  mongooseUtils
}
