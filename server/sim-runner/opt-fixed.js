const exec = require('./salt-runner')

const {
  saltPath: {home, scripts},
} = require('../config');

const script = 'RL_2phase_pressure.py'
const homeDir = '/home/ubuntu/uniq-sim'
const scenarioFile = 'salt.scenario.json'

async function run(simulation, mode) {
  const scenarioFilePath = `${home}/data/${simulation.id}/${scenarioFile}`
  console.log(simulation.id, mode)
  exec({
    homeDir,
    scriptDir: scripts,
    script,
    params: [
      '-s', scenarioFilePath,
      // '-m', 'fixed',
      '-n', 9, // model num
      '-m', mode,
      '-t', 563103625,
      '-o', simulation.id,
      '-b', simulation.configuration.begin, // 시작
      '-e', simulation.configuration.end, // 종료
      '-ep', simulation.configuration.epoch || 10, // epoch 회수
    ]
  })
}

module.exports = run



//PYTHONPATH=/home/ubuntu/uniq-sim/tools/libsalt
// python RL_2phase_pressure.py
// -s /home/ubuntu/uniq-sim/data/OPTI_202011_00653/salt.scenario.json
// -m fixed -t 563103625 -o OPTI_202011_00653 -b 0 -e 36000 -ep 10
