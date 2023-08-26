const chalk = require('chalk')

const {
  saltPath: { volumeOpt: volumePath },
  base,
  dockerBasePath
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
    return `run --rm --name ${name} -v ${volume} ${dockerImage} python ./run.py --mode ${mode}
    --map ${map} --start-time ${begin} --end-time ${end} --epoch ${epoch}
    --io-home io --scenario-file-path io/scenario
    --target-TL "${targetTL}"
    --model-save-period ${modelSavePeriod}
    --result-comp False
    --reward-func ${rewardFunc}
    --action ${action}`
  }

  if (mode === 'train') {
    // const cmd = `${makeCmd('train', simulation.id)}`
    // log(chalk.green(cmd))
    // return docker(cmd, options)


    const cmdSimulate = [
      `run --rm --name ${simulation.id}`,
      `-v ${dockerBasePath}/data:/uniq/data`,
      `-v ${dockerBasePath}/opt/${simulation.id}/input:/uniq/optimizer/input`,
      `-v ${dockerBasePath}/opt/${simulation.id}/output:/uniq/optimizer/output`,
      `-v ${dockerBasePath}/opt/${simulation.id}/model:/uniq/optimizer/model`,
      `-v ${dockerBasePath}/opt:/uniq/optimizer/opt`,
      'images4uniq/optimizer:v3.0.20230814',
      'python ./run_modutech.py',
      '--mode simulate',
      `--map ${map}`,
      `--start-time ${begin} --end-time ${end}`,
      `--epoch ${epoch}`,
      `--target-TL "${targetTL}"`,
      `--model-save-period ${modelSavePeriod}`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`
      // '--men-len 16'
    ].join(' ')

    const cmdTrain = [
      `run --rm --name ${simulation.id}`,
      `-v ${dockerBasePath}/data:/uniq/data`,
      `-v ${dockerBasePath}/opt/${simulation.id}/input:/uniq/optimizer/input`,
      `-v ${dockerBasePath}/opt/${simulation.id}/output:/uniq/optimizer/output`,
      `-v ${dockerBasePath}/opt/${simulation.id}/model:/uniq/optimizer/model`,
      `-v ${dockerBasePath}/opt:/uniq/optimizer/opt`,
      'images4uniq/optimizer:v3.0.20230814',
      'python ./run_modutech.py',
      '--mode train',
      `--map ${map}`,
      `--start-time ${begin} --end-time ${end}`,
      `--epoch ${epoch}`,
      `--target-TL "${targetTL}"`,
      `--model-save-period ${modelSavePeriod}`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`,
      '--mem-len 16'
    ].join(' ')


    log(chalk.green(cmdSimulate))
    log(chalk.yellow(cmdTrain))

    await docker(cmdSimulate, options)
    return docker(cmdTrain, options)

  } else if (mode === 'test') {
    // const cmdSimu = `${makeCmd('simulate', slaves[0])}`
    // const cmdTest = `${makeCmd('test', slaves[1])} --model-num ${modelNum}`
    // log(chalk.green(cmdSimu))
    // log(chalk.green(cmdTest))
    // return Promise.all([docker(cmdTest, options), docker(cmdSimu, options)])



    const cmdSimu = [
      `run --rm --name ${slaves[0]}`,
      `-v ${dockerBasePath}/data:/uniq/data`,
      `-v ${dockerBasePath}/opt/${simulation.id}/input:/uniq/optimizer/input`,
      `-v ${dockerBasePath}/opt/${simulation.id}/output:/uniq/optimizer/output`,
      `-v ${dockerBasePath}/opt/${simulation.id}/model:/uniq/optimizer/model`,
      `-v ${dockerBasePath}/opt:/uniq/optimizer/opt`,
      'images4uniq/optimizer:v3.0.20230814',
      'python ./run_modutech.py',
      '--mode simulate',
      `--map ${map}`,
      `--start-time ${begin} --end-time ${end}`,
      // `--epoch ${epoch}`,
      `--target-TL "${targetTL}"`,
      // `--model-save-period ${modelSavePeriod}`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`
      // '--men-len 16'
    ].join(' ')

    const cmdTest = [
      `run --rm --name ${slaves[1]}`,
      `-v ${dockerBasePath}/data:/uniq/data`,
      `-v ${dockerBasePath}/opt/${simulation.id}/input:/uniq/optimizer/input`,
      `-v ${dockerBasePath}/opt/${simulation.id}/output:/uniq/optimizer/output`,
      `-v ${dockerBasePath}/opt/${simulation.id}/model:/uniq/optimizer/model`,
      `-v ${dockerBasePath}/opt:/uniq/optimizer/opt`,
      'images4uniq/optimizer:v3.0.20230814',
      'python ./run_modutech.py',
      '--mode test',
      `--map ${map}`,
      `--start-time ${begin} --end-time ${end}`,
      `--epoch ${epoch}`,
      `--target-TL "${targetTL}"`,
      `--model-save-period ${modelSavePeriod}`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`,
      `--model-num ${modelNum}`,
      '--mem-len 16'
    ].join(' ')

    log(chalk.green(cmdTest))

    return Promise.all([
      docker(cmdTest, options),
      docker(cmdSimu, options)
    ]
    )
  } else if (mode === 'simulation') {

    // docker run --rm --name opt_xxx
    // -v c:\\home\\ubuntu\\uniq-simv2\\data:/uniq/data
    // -v c:\\home\\ubuntu\\uniq-simv2\\opt\\opt_xxx\\input:/uniq/optimizer/input
    // -v c:\\home\\ubuntu\\uniq-simv2\\opt\\opt_xxx\\output:/uniq/optimizer/output
    // -v c:\\home\\ubuntu\\uniq-simv2\\opt\\opt_xxx\\model:/uniq/optimizer/model
    // -v c:\\home\\ubuntu\\uniq-simv2\\opt:/uniq/optimizer/opt
    // images4uniq/optimizer:v3.0.20230814
    // python./ run_modutech.py--mode simulate--map doan

    const args = [
      `run --rm --name ${simulation.id}`,
      `-v ${base}/data:/uniq/data`,
      `-v ${base}/opt/${simulation.id}/input:/uniq/optimizer/input`,
      `-v ${base}/opt/${simulation.id}/output:/uniq/optimizer/output`,
      `-v ${base}/opt/${simulation.id}/model:/uniq/optimizer/model`,
      `-v ${base}/opt:/uniq/optimizer/opt`,
      'images4uniq/optimizer:v3.0.20230814',
      'python ./run_modutech.py',
      '--mode simulation',
      `--map ${map}`,
      `--start-time ${begin} --end-time ${end}`,
      `--epoch ${epoch}`,
      `--target-TL "${targetTL}"`,
      `--model-save-period ${modelSavePeriod}`,
      `--reward-func ${rewardFunc}`,
      `--method ${method}`,
      `--action ${action}`
    ]
    return args.join(' ')
  }
  else {
    return Promise.reject(new Error('unknown mode'))
  }
}

module.exports = run
