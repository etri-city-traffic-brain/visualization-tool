/*!
 * Simulation Runner
 * run traffic simulator on the local file system
 *
 */

const { dockerCommand: docker } = require('docker-cli-js')

const config = require('../config')
const {
  saltPath: { volumeSim }
} = config

const { log } = console

const DOCKER_IMAGE_DEFAULT = 'images4uniq/salt:v2.1a.20210915.test_BUS'

const VOLUME_HOST = volumeSim
const VOLUME_CONTAINER = '/uniq/simulator/salt/volume'
const RUN_SCRIPT = 'python /uniq/simulator/salt/bin/salt.py'

const buildConfigPath = sId =>
  `/uniq/simulator/salt/volume/sim/${sId}/input/salt.scenario.json`

module.exports = async simulation => {
  const simulationId = simulation.id
  const imgName = simulation.configuration.dockerImage || DOCKER_IMAGE_DEFAULT
  const configPath = buildConfigPath(simulationId)
  const volume = `${VOLUME_HOST}:${VOLUME_CONTAINER}`

  const simulationType = simulation.configuration.simulationType // meso | micro | multi
  log('*** start simulation ***', simulationType)

  if (simulationType === 'multi' || simulationType === 'micro') {
    const option = simulationType === 'multi' ? 'with_multi' : 'with_micro'
    log('simulation type:', option)
    log('docker image: ', simulation.configuration.dockerImage)
    return docker(
      `run --rm --name ${simulationId} -v ${volume} ${imgName} ${RUN_SCRIPT} -s ${configPath} -o ${option}`,
      { echo: true }
    )
  }


  return docker(
    `run --rm --name ${simulationId} -v ${volume} ${imgName} ${RUN_SCRIPT} -s ${configPath}`,
    { echo: false }
  )
}
