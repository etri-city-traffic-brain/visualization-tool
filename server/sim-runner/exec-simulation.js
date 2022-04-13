/*!
 * Simulation Runner
 * run traffic simulator on the local file system
 *
 */

const moment = require('moment')
const { dockerCommand } = require('docker-cli-js')

const config = require('../config')
const {
  saltPath: { home, volumeSim }
} = config

const imgName = 'images4uniq/salt:v2.1a.20210915.test_BUS'
// const imgName = 'images4uniq/salt:v2.1a.20210902'

const exeFile = '/uniq/simulator/salt/bin/salt.sh'
const { log } = console
const buildConfigPath = sId =>
  `/uniq/simulator/salt/volume/data/${sId}/salt.scenario.json`
const volumeHost = volumeSim

console.log('volume:', volumeHost)
async function run (sId) {
  const configPath = buildConfigPath(sId)
  const volumeContainer = '/uniq/simulator/salt/volume'
  return dockerCommand(
    `run --rm --name ${sId} -v ${volumeHost}:${volumeContainer} ${imgName} ${exeFile} ${configPath}`
  )
}

module.exports = simulation => {
  log('*** start simulation ***')
  log('simulation', simulation.id)
  run(simulation.id).then(r_ => {
    log('**** after run start cook ***', simulation.id)
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
}
