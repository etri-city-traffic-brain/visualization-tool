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

const DOCKER_IMAGE_DEFAULT = 'images4uniq/salt:v2.1a.20210915.test_BUS'

const VOLUME_HOST = volumeSim
const VOLUME_CONTAINER = '/uniq/simulator/salt/volume'
const RUN_SCRIPT = 'python /uniq/simulator/salt/bin/salt.py'

const buildConfigPath = sId =>
  `/uniq/simulator/salt/volume/data/${sId}/salt.scenario.json`

module.exports = async simulation => {
  const sId = simulation.id
  const img = simulation.configuration.dockerImage
  const imgName = img || DOCKER_IMAGE_DEFAULT
  const configPath = buildConfigPath(sId)
  const volume = `${VOLUME_HOST}:${VOLUME_CONTAINER}`
  console.log('*** start simulation ***')

  const sType = simulation.configuration.simulationType // meso | micro | multi

  if (sType === 'multi' || sType === 'micro') {
    const option = sType === 'multi' ? 'with_multi' : 'with_micro'
    console.log('simulation type:', option)
    console.log('docker image: ', simulation.configuration.dockerImage)
    return docker(
      `run --rm --name ${sId} -v ${volume} ${imgName} ${RUN_SCRIPT} -s ${configPath} -o ${option}`,
      { echo: true }
    )
  }

  return docker(
    `run --rm --name ${sId} -v ${volume} ${imgName} ${RUN_SCRIPT} -s ${configPath}`,
    { echo: false }
  )
}
