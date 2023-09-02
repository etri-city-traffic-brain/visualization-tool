/**
 * Register simulation
 *
 * author: yeonheon Gu
 * last modified: 2020-9-24
 *
 * 0. getting simulation from UI
 * 1. create config.json file for SALT simulator
 * 2. download scenario (data.zip)
 * 3. extract data.zip to simulation data directory
 * 4. add simulation info to Database
 */

const debug = require('debug')('api:create')
const fs = require('fs')
const util = require('util')
const createError = require('http-errors')

const mkdir = util.promisify(fs.mkdir)
const unlink = util.promisify(fs.unlink)
const writeFile = util.promisify(fs.writeFile)
const unzip = util.promisify(require('extract-zip'))
const makeScenario = require('../../main/simulation-manager/make-scenario')
const downloadScenario = require('./utils/prepare-scenario')
const downloadScenarioTest = require('./utils/prepare-scenario-test')
const addSimulation = require('../../main/simulation-manager/crud/create')

const {
  downloadScenarioByCoordinate
} = require('../../main/service/scenario-downloader')

const { log } = console
const {
  updateStatus,
  currentTimeFormatted,
  getSimulations,
  config
} = require('../../globals')

const { base, server } = config
const host = server.ip
const tcpPort = config?.server?.tcpPort

const existSimulation = id => getSimulations().find({ id }).value()
const stringify = obj => JSON.stringify(obj, false, 2)

const randomId = num =>
  ('S-' + (Math.random() * 10000000 + '').replace('.', '')).substring(0, 14) +
  '-' +
  num

async function createScenarioFile(targetDir, { host, body, id }, type) {
  await writeFile(
    // `${targetDir}/doan_${type}.scenario.json`,
    `${targetDir}/salt.scenario.json`,
    stringify(makeScenario({ host, ...body, id }, type))
  )
}

const makeOptScenario = (
  id,
  { configuration: { region, begin, end, period, interval = 10 } },
  fileDir
) => {
  return {
    scenario: {
      id,
      host,
      port: tcpPort,
      interval,
      time: {
        // begin: 0,
        // end: end - begin + 60
        begin,
        end: end + 60
      },
      input: {
        fileType: 'SALT',
        node: `../../data/scenario/${region}/${region}.node.xml`,
        link: `../../data/scenario/${region}/${region}.edge.xml`,
        connection: `../../data/scenario/${region}/${region}.connection.xml`,
        trafficLightSystem: `../../data/scenario/${region}/${region}.tss.xml`,
        route: `../../data/route/${region}/${region}_20220601.rou.xml`
      },
      parameter: {
        minCellLength: 30.0,
        vehLength: 5.0
      },
      output: {
        fileDir,
        period,
        level: 'link',
        save: 1
      }
    }
  }
}

async function createOPtScenarioFile(id, body, outDir, file, mode) {
  const configFile = makeOptScenario(id, body, file, mode)
  // console.log(configFile)
  await writeFile(outDir, stringify(configFile))
}

const refineDate = text => text.replace(/-/g, '')
const refineTime = text => text.replace(/:/g, '')

const refineParam = param => ({
  include: 0,
  fromDate: refineDate(param.fromDate),
  toDate: refineDate(param.toDate),
  fromTime: refineTime(param.fromTime),
  toTime: refineTime(param.toTime),
  region: param.region,
  partitions: param.partitions,
  subregion: 0,
  signal: 1,
  route: 1,
  event: 1,
  // weather: 1
  busstop: 1
})

/**
 * SALT 시뮬레이터를 위한 준비작업
 *
 */
async function prepareSimulation(id, body, role, slaves = [], type) {
  // const simInputDir = `${base}/data/${id}`
  // const simOutputDir = `${base}/output/${id}`
  const simBase = `${base}/sim/${id}`
  const simInputDir = `${base}/sim/${id}/input`
  const simOutputDir = `${base}/sim/${id}/output`

  try {

    await mkdir(simBase)
    await mkdir(simInputDir)
    await mkdir(simOutputDir)
    await addSimulation({ ...body, id, slaves, role })
    await createScenarioFile(simInputDir, { host, body, id }, type)

    const param = {
      ...body.configuration,
      ...refineParam(body.configuration)
    }

    log('area Type:', body.configuration.areaType)
    if (body.configuration.areaType != 'area') { // region or area
      const path = `${base}/data/scenario_sim/scenario_dj_${body.configuration.region}.zip`
      await unzip(path, { dir: simInputDir })
    } else {
      await downloadScenarioByCoordinate(param, param.area, simInputDir)
      await unzip(simInputDir + '/data.zip', { dir: simInputDir })
      await unlink(simInputDir + '/data.zip')
    }
    //
    if (param.microArea.minX) {
      await downloadScenarioByCoordinate(param, param.microArea, simInputDir)
      await unzip(simInputDir + '/data.zip', { dir: simInputDir + '/multiarea' })
      await unlink(simInputDir + '/data.zip')
    }
  } catch (err) {
    log(err.message)
    updateStatus(id, 'error', { error: err.message })
    return err
  }
  updateStatus(id, 'ready', {})
  log(`[simulation] ${id} is ready`)
}

// 신호 학습을 위한 시나리오 파일 생성
async function prepareOptimization(ids, body) {

  const [idTrain, idTest, idSimulate] = ids

  const optDir = `${base}/opt/${idTrain}`
  const inputDir = `${optDir}/input`

  await mkdir(optDir)
  await mkdir(inputDir)

  const configFileTrain = makeOptScenario(idTrain, body, 'output/train/')
  const configFileTest = makeOptScenario(idTest, body, 'output/test/')
  const configFileSimulate = makeOptScenario(idSimulate, body, 'output/simulate/')

  try {
    await writeFile(`${inputDir}/${body.configuration.region}_train.scenario.json`, stringify(configFileTrain))
    await writeFile(`${inputDir}/${body.configuration.region}_test.scenario.json`, stringify(configFileTest))
    await writeFile(`${inputDir}/${body.configuration.region}_simulate.scenario.json`, stringify(configFileSimulate))
  } catch (err) {
    console.log(err)
  }

  updateStatus(ids[0], 'ready', {})
}
const ROLE = {
  TRAINING: 'training',
  TEST: 'test',
  FIXED: 'fixed',
  SIMULATION: 'simulation'
}

/**
 * 요청 type 에 따른 시률레이션 설정 생성
 */
module.exports = async (req, res, next) => {
  const { body: { id, type } = {} } = req
  debug(`prepare simulation ${id}`)

  if (!id) {
    next(createError(403, 'simulation ID is missed...'))
    return
  }

  if (existSimulation(id)) {
    next(createError(409, `simulation [${id}] already exists...`))
    return
  }
  try {
    if (type === 'optimization') {
      const idTest = randomId(0) // for test
      const idFixed = randomId(1) // for fixed

      await addSimulation({
        ...req.body,
        id,
        slaves: [idTest, idFixed],
        role: ROLE.TRAINING
      })
      await prepareOptimization([id, idTest, idFixed], req.body)
    } else {
      await prepareSimulation(id, req.body, ROLE.SIMULATION)
    }
    debug(`simulation ${id} is ready!`)
    res.json({ id })
  } catch (err) {
    debug(err.message)
    updateStatus(id, 'error', {
      error: `fail to create simulation - ${err.message}`,
      ended: currentTimeFormatted()
    })
    next(createError(500, err.message))
  }
}
