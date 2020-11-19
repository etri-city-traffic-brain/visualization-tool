
const debug = require('debug')('api:remove-simulation');

const fs = require('fs');
const util = require('util');
const rmdir = util.promisify(require('rimraf'));

const { getSimulations, mongooseUtils, config } = require('../../../globals');

const { saltPath: { output, data } } = config

module.exports = async (simulationId) => {
  if(!mongooseUtils.isConnected()) {
    throw new Error('Cannot delete simulation, Simulation Database not connected');
  }
  const simulation = getSimulations().find({ id: simulationId }).value();

  if (!simulation) {
    debug(`simulation(${simulationId} does not exists`);
    throw new Error(`simulation(${simulationId}) not exists...`);
  }

  const targetDirOutput = `${output}/${simulationId}`;
  const targetDirData = `${data}/${simulationId}`;

  try {
    await getSimulations().remove({ id: simulationId }).write();
    if (fs.existsSync(targetDirData)) {
      await rmdir(targetDirData);
    }
    if (fs.existsSync(targetDirOutput)) {
      await rmdir(targetDirOutput);
    }

    try {
      await mongooseUtils.dropCollection('simulation_results', simulationId);
    } catch (err) {
      // ignore
    }
  } catch (err) {
    throw err;
  }
}
