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

module.exports = ({ simulationId, script: scriptFile }) => new Promise((resolve, reject) => {

  const script = 'default.py'
  const process = exec({
    homeDir: home,
    scriptDir: scripts,
    script,
  })

  process.on("close", code => {
    log(`child process exited with code ${code}`);
  });

  resolve()
});
