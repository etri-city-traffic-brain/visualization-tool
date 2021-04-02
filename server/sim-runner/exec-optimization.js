const exec = require('./exec')
const chalk = require('chalk')

const {
  saltPath: { home, scripts }
} = require('../config')

const { log } = console

async function run (simulation, mode, modelNum) {
  if (!simulation || !mode) {
    log('check argruments: simulation or mode is missed')
    return false
  }

  const scenarioFilePath = `${home}/data/${simulation.id}/salt.scenario.json`

  log('******************************************')
  log('*       ID: ', simulation.id)
  log('*     Mode: ', mode)
  log('*    Model: ', modelNum)
  log('******************************************')

  const optimizationId = mode === 'train' ? simulation.id : simulation.masterId
  const script = `${scripts}/${simulation.configuration.script}`
  const pythonPath = `${home}/tools/libsalt/`

  exec({
    // home,
    // scriptDir: scripts,
    pythonPath,
    script,
    params: [
      '-s', scenarioFilePath,
      '-n', modelNum, // model num
      '-m', mode,
      '-t', 563103625,
      '-o', optimizationId,
      '-b', simulation.configuration.begin, // 시작
      '-e', simulation.configuration.end, // 종료
      '-ep', simulation.configuration.epoch || 9 // epoch 회수
    ]
  })
}

module.exports = run
