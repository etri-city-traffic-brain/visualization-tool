const exec = require('./salt-runner')

const {
  saltPath: {home, scripts},
} = require('../config');

const script = 'RL_2phase_pressure.py'
const homeDir = '/home/ubuntu/uniq-sim'
const scenarioFile = 'salt.scenario.json'

async function run(simulation, mode, modelNum = 9) {
  const scenarioFilePath = `${home}/data/${simulation.id}/${scenarioFile}`
  // console.log(simulation.id, mode, modelNum = 9)
  console.log('****: ')
  console.log('****: ', simulation.id, mode, modelNum)
  console.log('****: ')
  const sId = mode === 'train' ? simulation.id : simulation.masterId

  exec({
    homeDir,
    scriptDir: scripts,
    script,
    params: [
      '-s', scenarioFilePath,
      // '-m', 'fixed',
      '-n', modelNum, // model num
      '-m', mode,
      '-t', 563103625,
      '-o', sId,
      '-b', simulation.configuration.begin, // 시작
      '-e', simulation.configuration.end, // 종료
      '-ep', simulation.configuration.epoch || 9, // epoch 회수
    ]
  })
}

module.exports = run
