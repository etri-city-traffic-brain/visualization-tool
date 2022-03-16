
const chalk = require('chalk')

const {
  saltPath: { home, volume }
} = require('../config')

const { log } = console
const { dockerCommand } = require('docker-cli-js')

// const img = 'images4uniq/optimizer:v0.1a.20210927'
// const img = 'images4uniq/optimizer:v0.1a.20210929'
// const img = 'images4uniq/optimizer:v0.1a.20210930'
// const img = 'images4uniq/optimizer:v0.1a.20210930b'
const defaultImg = 'images4uniq/optimizer:v0.1a.20211028'

async function run (simulation, mode, modelNum) {
  if (!simulation || !mode) {
    log('check argruments: simulation or mode is missed')
    return false
  }

  console.log('docker image: ', simulation.configuration.dockerImage)
  const epoch = simulation.configuration.epoch
  const img = simulation.configuration.dockerImage || defaultImg
  const begin = 0
  const end = simulation.configuration.end - simulation.configuration.begin + 60
  const modelSavePeriod = simulation.configuration.modelSavePeriod || 20
  log('******************************************')
  log('*       ID: ', simulation.id)
  log('*     Mode: ', mode)
  log('*    Model: ', modelNum)
  log('*    begin: ', begin)
  log('*      end: ', end)
  log('*  modelSavePeriod: ', modelSavePeriod)
  log('******************************************')

  const sId = simulation.id
  const fTrain = 'io/scenario/doan/salt.scenario.train.json'
  const fTest = 'io/scenario/doan/salt.scenario.test.json'
  const fSimulate = 'io/scenario/doan/salt.scenario.simulation.json'

  // const volume = `c/home/ubuntu/uniq-sim/data/${sId}:/uniq/optimizer/io`
  const volume_ = `${volume}/${sId}:/uniq/optimizer/io`

  const trainCmd = [
    'run', '--rm',
    '--name', sId,
    '-v', volume_, img,
    'python', './run.py',
    '--mode', 'train',
    '--start-time', begin,
    '--end-time', end,
    '--epoch', epoch,
    '--io-home', 'io',
    '--scenario-file-path', fTrain,
    '--model-save-period ', modelSavePeriod

  ]

  if (mode === 'train') {
    // return dockerCommand(`run --rm -v ${volume_} ${img} python ./run.py --mode train --start-time ${begin} --end-time ${end} --epoch ${epoch} --io-home io --scenario-file-path ${fTrain}`)
    return dockerCommand(trainCmd.join(' '))
  } else if (mode === 'test') {
    dockerCommand(`run --rm -v ${volume_} ${img} python ./run.py --mode simulate --start-time ${begin} --end-time ${end} --epoch 5 --io-home io --scenario-file-path ${fSimulate}`)
    return dockerCommand(`run --rm -v ${volume_} ${img} python ./run.py --mode test --start-time ${begin} --end-time ${end} --epoch 5 --io-home io --model-num ${modelNum} --scenario-file-path ${fTest}`)
  } else {
    return Promise.reject(new Error('unknown mode'))
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
