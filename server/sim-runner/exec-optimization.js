
const chalk = require('chalk')

const {
  saltPath: { home }
} = require('../config')

const { log } = console
const { dockerCommand } = require('docker-cli-js')

const img = 'images4uniq/optimizer:v0.1a.20210927'

async function run (simulation, mode, modelNum) {
  if (!simulation || !mode) {
    log('check argruments: simulation or mode is missed')
    return false
  }

  log('******************************************')
  log('*       ID: ', simulation.id)
  log('*     Mode: ', mode)
  log('*    Model: ', modelNum)
  log('******************************************')

  const sId = simulation.id

  if (mode === 'train') {
    return dockerCommand(`run --rm -v /c/home/ubuntu/uniq-sim/data/${sId}:/uniq/optimizer/io ${img} python ./run.py --mode train --epoch 5 --io-home io --scenario-file-path io/scenario/doan/salt.scenario.train.json`)
  } else if (mode === 'test') {
    dockerCommand(`run --rm -v /c/home/ubuntu/uniq-sim/data/${sId}:/uniq/optimizer/io ${img} python ./run.py --mode test --epoch 5 --io-home io --scenario-file-path io/scenario/doan/salt.scenario.test.json`)
    return dockerCommand(`run --rm -v /c/home/ubuntu/uniq-sim/data/${sId}:/uniq/optimizer/io ${img} python ./run.py --mode simulate --epoch 5 --io-home io --scenario-file-path io/scenario/doan/salt.scenario.simulation.json`)
  } else {
    Promise.reject(new Error('unknown mode'))
  }
}

module.exports = run

// exec({
//   pythonPath,
//   script,
//   params: [
//     '-s', scenarioFilePath,
//     '-n', modelNum, // model num
//     '-m', mode,
//     '-t', 563103625,
//     '-o', optimizationId,
//     '-b', simulation.configuration.begin, // 시작
//     '-e', simulation.configuration.end, // 종료
//     '-ep', simulation.configuration.epoch || 9 // epoch 회수
//   ]
// })
