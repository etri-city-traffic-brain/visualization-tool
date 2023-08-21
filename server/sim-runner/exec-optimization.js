const chalk = require('chalk')

const {
  saltPath: { volumeOpt: volumePath }
} = require('../config')

const { log } = console
const { dockerCommand: docker } = require('docker-cli-js')

const DEFAULT_DOCKER_IMAGE = 'images4uniq/optimizer:v0.1a.20220418'

const options = {
  machineName: undefined, // uses local docker
  currentWorkingDirectory: undefined, // uses current working directory
  echo: true, // echo command output to stdout/stderr
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
async function run(simulation, mode, modelNum) {
  if (!simulation || !mode) {
    log('check argruments: simulation or mode is missed')
    return false
  }

  const config = simulation.configuration
  const slaves = simulation.slaves
  const epoch = config.epoch
  const dockerImage = config.dockerImage || DEFAULT_DOCKER_IMAGE
  const begin = config.begin
  const end = config.end + 60
  const modelSavePeriod = config.modelSavePeriod || 20
  const map = config.region
  const targetTL = config.junctionId // ex) comma seperated string ex) "SA 101,SA 111",
  // const targetTL = 'SA 1701' // ex) comma seperated string ex) "SA 101,SA 111",
  const action = config.action
  const method = config.method
  const rewardFunc = config.rewardFunc
  const volume = `${volumePath}/${simulation.id}:/uniq/optimizer/io`

  const makeCmd = (mode, name) => {
    // const args = [
    //   `run --rm --name ${name} -v ${volume} ${dockerImage}`,
    //   'python ./run.py',
    //   `--mode ${mode}`,
    //   `--map ${map}`,
    //   `--start-time ${begin} --end-time ${end}`,
    //   `--epoch ${epoch}`,
    //   '--io-home io',
    //   '--scenario-file-path io/scenario',
    //   `--target-TL "${targetTL}"`,
    //   `--model-save-period ${modelSavePeriod}`,
    //   '--result-comp False',
    //   `--reward-func ${rewardFunc}`,
    //   `--method ${method}`,
    //   `--action ${action}`
    // ]
    // return args.join(' ')
    return `run --rm --name ${name} -v ${volume} ${dockerImage} python ./run.py --mode ${mode} --map ${map} --start-time ${begin} --end-time ${end} --epoch ${epoch} --io-home io --scenario-file-path io/scenario --target-TL "${targetTL}" --model-save-period ${modelSavePeriod} --result-comp False --reward-func ${rewardFunc} --action ${action}`
  }

  if (mode === 'train') {
    const cmd = `${makeCmd('train', simulation.id)}`
    log(chalk.green(cmd))
    return docker(cmd, options)
  } else if (mode === 'test') {
    const cmdSimu = `${makeCmd('simulate', slaves[0])}`
    const cmdTest = `${makeCmd('test', slaves[1])} --model-num ${modelNum}`
    log(chalk.green(cmdSimu))
    log(chalk.green(cmdTest))
    return Promise.all([docker(cmdTest, options), docker(cmdSimu, options)])
  } else {
    return Promise.reject(new Error('unknown mode'))
  }
}

module.exports = run
