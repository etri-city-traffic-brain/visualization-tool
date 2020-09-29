/*!
 * Simulation Runner
 * run simulater on the remote server
 *
 */
const { PythonShell } = require('python-shell');

const config = require('../../config');

const {
  saltPath: { data },
  salt: { standalone },
} = config;

// const { getConfigFilePath, getScenarioFilePath } = require('./utils/globals');

module.exports = ({ simulationId }) => new Promise((resolve, reject) => {
  const configFile = `${data}/${simulationId}/salt.config.json`;
  const scenarioFile = `${data}/${simulationId}/salt.scenario.json`;

  // const configFile = getConfigFilePath(simulationId);
  // const scenarioFile = getScenarioFilePath(simulationId);

  const options = {
    mode: 'text',
    pythonOptions: ['-u'],
    args: ['-c', configFile, '-s', scenarioFile],
  };

  PythonShell.run(standalone, options, (err, results) => {
    if (err) {
      reject(err);
    } else {
      resolve(results);
    }
  });
});
