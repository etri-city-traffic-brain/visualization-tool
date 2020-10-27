const mongoose = require('mongoose');

const SIMULATION_RESULT_DB = 'simulation_results'

const dropCollection = async (dbName, collectionName) => {
  const targetDb = mongoose.connection.useDb(dbName);
  await targetDb.collection(collectionName).drop();
};

const dropSimulationCollection = async (collectionName) => {
  const targetDb = mongoose.connection.useDb(SIMULATION_RESULT_DB);
  await targetDb.collection(collectionName).drop();
}

const isConnected = () => mongoose.connection.readyState === 1;

const useDB = name => mongoose.connection.useDb(name);
const useSimulationDB = () => useDB(SIMULATION_RESULT_DB)
module.exports = {
  dropCollection,
  dropSimulationCollection,
  isConnected,
  useDB,
  useSimulationDB,
};
