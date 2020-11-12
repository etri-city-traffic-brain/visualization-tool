const exec = require('./salt-runner')

const {
  saltPath: {home, scripts},
} = require('../config');

const script = 'RL_2phase_pressure.py'
const homeDir = '/home/ubuntu/uniq-vis'
// const scriptDir = `${homeDir}`
const scenarioFile = 'salt.scenario.json'
async function run(simulationId) {
  const scenarioFilePath = `${home}/data/${simulationId}/${scenarioFile}`

  exec({
    homeDir,
    scriptDir: scripts,
    script,
    params: [
      '-s', scenarioFilePath,
      '-m', 'test',
      '-n', 2,
      '-t', 563103625,
      '-o', simulationId,
      '-b', 0,
      '-e', 36000,
      '-ep', 10,
    ]
  })
}

module.exports = run



// PYTHONPATH=/home/ubuntu/uniq-sim/tools/libsalt
// python RL_2phase_pressure.py
// -s /home/ubuntu/uniq-sim/data/OPTI_202011_00653/salt.scenario.json
// -m test -n 2 -t 563103625 -o OPTI_202011_00653 -b 0 -e 36000 -ep 10
