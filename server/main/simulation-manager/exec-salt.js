/*!
 * Simulation Runner
 * run traffic simulator on the local file system
 *
 */
const { PythonShell } = require('python-shell');

const config = require('../../config');
const exec = require('../../sim-runner/salt-runner')

const {
  saltPath: {home, scripts},
} = config;
const { log } = console

const scenarioFile = 'salt.scenario.json'

module.exports = ({ simulationId, script: scriptFile = 'default.py' }) => new Promise((resolve, reject) => {

  const scenarioFilePath = `${home}/data/${simulationId}/${scenarioFile}`

  const process = exec({
    homeDir: home,
    scriptDir: scripts,
    script: scriptFile,
    params: ['-s', scenarioFilePath]
  })

  process.on("close", code => {
    log(`child process exited with code ${code}`);
  });

  resolve()
});
