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

const existSimulation = id =>
  getSimulations()
    .find({ id })
    .value()
const stringify = obj => JSON.stringify(obj, false, 2)

const randomId = num =>
  ('S-' + (Math.random() * 10000000 + '').replace('.', '')).substring(0, 14) +
  '-' +
  num

async function createScenarioFile (targetDir, { host, body, id }, type) {
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
        begin: 0,
        end: end - begin + 60
      },
      input: {
        fileType: 'SALT',
        node: `${region}.node.xml`,
        link: `${region}.edge.xml`,
        connection: `${region}.connection.xml`,
        trafficLightSystem: `${region}.tss.xml`,
        route: `${region}.rou.xml`
      },
      parameter: {
        minCellLength: 30.0,
        vehLength: 5.0
      },
      output: {
        fileDir,
        period,
        level: 'cell',
        save: 1
      }
    }
  }
}

async function createOPtScenarioFile (id, body, outDir, file, mode) {
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
async function prepareSimulation (id, body, role, slaves = [], type) {
  const simInputDir = `${base}/data/${id}`
  const simOutputDir = `${base}/output/${id}`

  try {
    await mkdir(simInputDir)
    await mkdir(simOutputDir)
    await addSimulation({ ...body, id, slaves, role })
    await createScenarioFile(simInputDir, { host, body, id }, type)

    const path = `${base}/routes/scenario_dj_${body.configuration.region}.zip`
    await unzip(path, { dir: simInputDir })
    //
    // const param = {
    //   ...body.configuration,
    //   ...refineParam(body.configuration)
    // }
    // await downloadScenarioByCoordinate(param, simInputDir)
    // await unzip(simInputDir + '/data.zip', { dir: simInputDir })
  } catch (err) {
    log(err)
    return err
  }
  updateStatus(id, 'ready', {})
  log(`[simulation] ${id} is ready`)
}

async function prepareOptimization (ids, body) {
  const targetDir = `${base}/data/${ids[0]}`
  const simOutputDir = `${base}/output/${ids[0]}`
  await mkdir(simOutputDir)

  const region = body.configuration.region // 'doan'
  const path = `/home/ubuntu/uniq-sim/routes/scenario_${region}.zip`
  await unzip(path, { dir: targetDir })

  log(`rename ${targetDir}/scenario_${region} to ${targetDir}/scenario`)

  fs.renameSync(`${targetDir}/scenario_${region}`, `${targetDir}/scenario`)

  createOPtScenarioFile(
    ids[0],
    body,
    `${targetDir}/scenario/${region}/${region}_train.scenario.json`,
    '/uniq/optimizer/output/train/'
  )
  createOPtScenarioFile(
    ids[1],
    body,
    `${targetDir}/scenario/${region}/${region}_test.scenario.json`,
    '/uniq/optimizer/output/test/'
  )
  createOPtScenarioFile(
    ids[2],
    body,
    `${targetDir}/scenario/${region}/${region}_simulate.scenario.json`,
    '/uniq/optimizer/output/simulate/'
  )
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
