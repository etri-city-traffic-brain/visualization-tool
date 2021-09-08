/*!
 * Simulation Runner
 * run traffic simulator on the local file system
 *
 */

const config = require('../config')
// const exec = require('./exec')

const { exec } = require('child_process')

const {
  saltPath: { home, scripts }
} = config

// const { getSimulation } = require('../../globals')
const scenarioFile = 'salt.scenario.json'

const volume = 'C:\\home\\ubuntu\\uniq-sim'
const imgName = 'images4uniq/salt:v2.1a.0622'
const exeFile = '/uniq/simulator/salt/bin/salt-standalone'
// const config = '/uniq/simulator/salt/volume/data/sample/sample.json'
const { log } = console
const buildConfigPath = sId => `/uniq/simulator/salt/volume/data/${sId}/salt.scenario.json`

async function run (sId) {
  const configPath = buildConfigPath(sId)
  return new Promise((resolve, reject) => {
    exec(`docker run -v ${volume}:/uniq/simulator/salt/volume ${imgName} ${exeFile} ${configPath} --rm`, (error, stdout, stderr) => {
      if (error) {
        log('error')
        log(error.message)
        reject(error)
        return
      }
      if (stderr) {
        log(`stderr: ${stderr}`)
        reject(stderr)
        return
      }
      log(`stdout: ${stdout}`)
      resolve(stdout)
    })
  })
}

module.exports = (simulation) => {
  // const simulation = getSimulation(simulationId)
  // const scenarioFilePath = `${home}/data/${simulation.id}/${scenarioFile}`
  // const script = `${scripts}/${simulation.configuration.script}`
  // const pythonPath = `${home}/tools/libsalt/`

  console.log('*** start simulation ***')
  log('simulation', simulation.id)
  run(simulation.id)
  // exec({
  //   pythonPath,
  //   script,
  //   params: ['-s', scenarioFilePath]
  // })
}
