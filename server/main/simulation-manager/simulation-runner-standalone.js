/*!
 * Simulation Runner
 * run simulater on the remote server
 *
 */
const { PythonShell } = require('python-shell');

const {
  config: {
    saltPath: { data },
    salt: { standalone },
  },
} = global.SALT;

module.exports = ({ simulationId }) => new Promise((resolve, reject) => {
  const configFile = `${data}/${simulationId}/salt.config.json`;
  const scenarioFile = `${data}/${simulationId}/salt.scenario.json`;

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
