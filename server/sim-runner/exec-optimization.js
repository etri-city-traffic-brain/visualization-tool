const chalk = require('chalk')

const {
  saltPath: { volume: volumePath }
} = require('../config')

const { log } = console
const { dockerCommand: docker } = require('docker-cli-js')

const DEFAULT_DOCKER_IMAGE = 'images4uniq/optimizer:v0.1a.20220418'

const options = {
  machineName: undefined, // uses local docker
  currentWorkingDirectory: undefined, // uses current working directory
  echo: false, // echo command output to stdout/stderr
  env: undefined,
  stdin: undefined
}

/**
 * 도커 명령을 사용해서 신호 최적화 컨테이너 실행
 *
 * @param {Object} simulation
 * @param {String} mode
 * @param {Number} modelNum
 * @returns {Promise}
 */
async function run (simulation, mode, modelNum) {
  if (!simulation || !mode) {
    log('check argruments: simulation or mode is missed')
    return false
  }

  const epoch = simulation.configuration.epoch
  const dockerImage =
    simulation.configuration.dockerImage || DEFAULT_DOCKER_IMAGE
  const begin = 0
  const end = simulation.configuration.end - simulation.configuration.begin + 60
  const modelSavePeriod = simulation.configuration.modelSavePeriod || 20
  const map = simulation.configuration.region

  const volume = `${volumePath}/${simulation.id}:/uniq/optimizer/io`

  // const targetTL = 'SA 101,SA 104,SA 107,SA 111'
  const targetTL = simulation.configuration.junctionId
  const makeCmd = mode =>
    `run --rm -v ${volume} ${dockerImage} python ./run.py \
     --mode ${mode} \
     --map ${map} \
     --start-time ${begin} \
     --end-time ${end} \
     --epoch ${epoch} \
     --io-home io \
     --scenario-file-path io/scenario \
     --target-TL "${targetTL}" \
     --model-save-period ${modelSavePeriod} \
     --result-comp False \
     --action offset`

  if (mode === 'train') {
    const cmd = `${makeCmd('train')} --model-save-period ${modelSavePeriod}`
    log(chalk.green(cmd))
    return docker(cmd, options)
  } else if (mode === 'test') {
    const cmdSimu = `${makeCmd('simulate')}`
    const cmdTest = `${makeCmd('test')} --model-num ${modelNum}`
    return Promise.all([docker(cmdSimu), docker(cmdTest)])
  } else {
    return Promise.reject(new Error('unknown mode'))
  }
}

module.exports = run
