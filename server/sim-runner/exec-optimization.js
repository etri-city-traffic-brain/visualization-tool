const chalk = require('chalk')

const {
  dockerBasePath
} = require('../config')

const { log } = console
const { dockerCommand: docker } = require('docker-cli-js')

const options = {
  machineName: undefined, // uses local docker
  currentWorkingDirectory: undefined, // uses current working directory
  echo: true, // echo command output to stdout/stderr
  env: undefined,
  stdin: undefined
}

const MODE_TRAIN = 'train'
const MODE_TEST = 'test'

/**
 * 도커 명령을 사용해서 신호 최적화 컨테이너 실행
 *
 * @param {Object} simulation
 * @param {String} mode
 * @param {Number} modelNum
 * @returns {Promise}
 */
async function run(simulation, mode, modelNum) {
  if (!simulation || !mode) {
    log('check argruments: simulation or mode is missed')
    return false
  }

  const config = simulation.configuration
  const slaves = simulation.slaves
  const epoch = config.epoch
  const dockerImage = config.dockerImage
  const begin = config.begin
  const end = config.end + 60
  const modelSavePeriod = config.modelSavePeriod || 1
  const targetTL = config.junctionId // ex) comma seperated string ex) "SA 101,SA 111",
  const action = config.action
  const method = config.method
  const rewardFunc = config.rewardFunc
  const runScript = 'python ./run_modutech.py'

  const duration = [
    `--start-time ${begin}`,
    `--end-time ${end}`,
  ]

  const volumes = [
    `-v ${dockerBasePath}/data:/uniq/data`,
    `-v ${dockerBasePath}/opt/${simulation.id}/input:/uniq/optimizer/input`,
    `-v ${dockerBasePath}/opt/${simulation.id}/output:/uniq/optimizer/output`,
    `-v ${dockerBasePath}/opt/${simulation.id}/model:/uniq/optimizer/model`,
    `-v ${dockerBasePath}/opt:/uniq/optimizer/opt`,
  ]
  const map = `--map ${config.region}`

  const run = id => `run --rm --name ${id}`

  const trainModeParam = '--mode train'
  const testModeParam = '--mode test'
  const simulateModeParam = '--mode simulate'

  if (mode === MODE_TRAIN) {

    const cmdSimulate = [
      run(simulation.id),
      ...volumes,
      dockerImage,
      runScript,
      simulateModeParam,
      map,
      ...duration,
      `--target-TL "${targetTL}"`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`,
      `--epoch ${epoch}`,
      `--model-save-period ${modelSavePeriod}`,
      // '--men-len 16'
    ]

    const cmdTrain = [
      run(simulation.id),
      ...volumes,
      dockerImage,
      runScript,
      trainModeParam,
      map,
      ...duration,
      `--target-TL "${targetTL}"`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`,
      `--epoch ${epoch}`,
      `--model-save-period ${modelSavePeriod}`,
      '--mem-len 16'
    ]


    log(chalk.green(cmdSimulate.join('\n')))
    log(chalk.yellow(cmdTrain.join('\n')))

    await docker(cmdSimulate.join(' '), options)
    return docker(cmdTrain.join(' '), options)
  }
  if (mode === MODE_TEST) {
    const cmdSimu = [
      run(slaves[0]),
      ...volumes,
      dockerImage,
      runScript,
      simulateModeParam,
      map,
      ...duration,
      `--target-TL "${targetTL}"`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`,
      `--epoch ${epoch}`,
      `--model-save-period ${modelSavePeriod}`,
      `--model-num ${modelNum}`,
      // '--mem-len 16'
    ]

    const cmdTest = [
      run(slaves[1]),
      ...volumes,
      dockerImage,
      runScript,
      testModeParam,
      map,
      ...duration,
      `--target-TL "${targetTL}"`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`,
      `--epoch ${epoch}`,
      `--model-save-period ${modelSavePeriod}`,
      `--model-num ${modelNum}`,
      '--a-lr 0.005',
      '--c-lr 0.005',
      '--mem-len 16'
    ]

    log(chalk.green(cmdSimu.join('\n')))
    log(chalk.yellow(cmdTest.join('\n')))

    return Promise.all([docker(cmdTest.join(' '), options), docker(cmdSimu.join(' '), options)]
    )
  }

  return Promise.reject(new Error('unknown mode'))

}

module.exports = run
