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

const makeScenario = require('../../main/simulation-manager/make-scenario')
const downloadScenario = require('./utils/prepare-scenario')
const downloadScenarioTest = require('./utils/prepare-scenario-test')
const addSimulation = require('../../main/simulation-manager/crud/create')

const {
  updateStatus, currentTimeFormatted, getSimulations, config
} = require('../../globals')

const { base, server } = config
const host = server.ip
const existSimulation = id => getSimulations().find({ id }).value()
const stringify = obj => JSON.stringify(obj, false, 2)

const randomId = (num) => ('S-' + ((Math.random() * 10000000) + '').replace('.', '')).substring(0, 14) + '-' + num

async function createScenarioFile (targetDir, { host, body, id }) {
  await writeFile(
    `${targetDir}/salt.scenario.json`,
    stringify(makeScenario({ host, ...body, id }))
  )
}

async function prepareSimulation (id, body, role, slaves = []) {
  const simInputDir = `${base}/data/${id}`
  const simOutputDir = `${base}/output/${id}`
  await mkdir(simInputDir)
  await mkdir(simOutputDir)
  await addSimulation({ ...body, id, slaves, role })
  await createScenarioFile(simInputDir, { host, body, id })

  // await downloadScenario(simInputDir, body.configuration)

  await downloadScenarioTest(simInputDir, body.configuration)
  console.log('*** caution: you have to update this scenario download ***')
  console.log('file: api-create.js, line: 55')

  updateStatus(id, 'ready', {})
}

const ROLE = {
  TRAINING: 'training',
  TEST: 'test',
  FIXED: 'fixed',
  SIMULATION: 'simulation'
}

/**
 * 신호최적화 시무률레이션을 위한 입력데이터를 준비한다.
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
      await prepareSimulation(id, req.body, ROLE.TRAINING, [idTest, idFixed])
      req.body.masterId = id
      await prepareSimulation(idTest, req.body, ROLE.TEST, [])
      await prepareSimulation(idFixed, req.body, ROLE.FIXED, [])
    } else {
      console.log('prepare simulation data')
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
