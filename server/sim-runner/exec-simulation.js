/*!
 * Simulation Runner
 * run traffic simulator on the local file system
 *
 */

const config = require('../config')
// const exec = require('./exec')
const moment = require('moment')
const cookSimulationResult = require('../main/simulation-manager/cook')
const { getSimulation, updateStatus } = require('../globals')
const { exec } = require('child_process')

const {
  saltPath: { home, scripts }
} = config

// const { getSimulation } = require('../../globals')
const scenarioFile = 'salt.scenario.json'

const volume = 'C:\\home\\ubuntu\\uniq-sim'
const imgName = 'images4uniq/salt:v2.1a.20210915.test_BUS'
const exeFile = '/uniq/simulator/salt/bin/salt.sh'
const { log } = console
const buildConfigPath = sId => `/uniq/simulator/salt/volume/data/${sId}/salt.scenario.json`

async function run (sId) {
  const configPath = buildConfigPath(sId)
  return new Promise((resolve, reject) => {
    exec(`docker run -v ${volume}:/uniq/simulator/salt/volume ${imgName} ${exeFile} ${configPath} --rm`, (error, stdout, stderr) => {
      if (error) {
        // log('error')
        log(error.message)
        reject(error)
        return
      }
      if (stderr) {
        log(`stderr: ${stderr}`)
        reject(new Error(stderr))
        return
      }
      // log(`stdout: ${stdout}`)
      resolve()
    })
  })
}

const currentTimeFormatted = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

module.exports = (simulation) => {
  // const simulation = getSimulation(simulationId)
  // const scenarioFilePath = `${home}/data/${simulation.id}/${scenarioFile}`
  // const script = `${scripts}/${simulation.configuration.script}`
  // const pythonPath = `${home}/tools/libsalt/`

  log('*** start simulation ***')
  log('simulation', simulation.id)
  run(simulation.id).then(r_ => {
  //   log('**** after run start cook ***', simulation.id)
  //   cookSimulationResult({
  //     simulationId: simulation.id,
  //     duration: simulation.configuration.end,
  //     period: simulation.configuration.period
  //   }).then(() => {
  //     updateStatus(simulation.id, 'finished')
  //   }).catch(err => {
  //     console.log(err)
  //     updateStatus(simulation.id, 'error', {
  //       error: `fail to start simulation ${err.message}`,
  //       ended: currentTimeFormatted()
  //     })
  //   })
  // }).catch(err => {
  //   updateStatus(simulation.id, 'error', {
  //     error: `fail to start simulation ${err.message}`,
  //     ended: currentTimeFormatted()
  //   })
  })
  // exec({
  //   pythonPath,
  //   script,
  //   params: ['-s', scenarioFilePath]
  // })
}
