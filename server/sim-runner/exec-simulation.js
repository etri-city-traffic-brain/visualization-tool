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
const RUN_SCRIPT = '/uniq/simulator/salt/bin/salt.sh'

const buildConfigPath = sId =>
  `/uniq/simulator/salt/volume/data/${sId}/salt.scenario.json`

module.exports = async simulation => {
  const sId = simulation.id
  const img = simulation.configuration.dockerImage

  const imgName = img || DOCKER_IMAGE_DEFAULT
  const configPath = buildConfigPath(sId)
  const volume = `${VOLUME_HOST}:${VOLUME_CONTAINER}`
  return docker(
    `run --rm --name ${sId} -v ${volume} ${imgName} ${RUN_SCRIPT} ${configPath}`,
    { echo: false }
  )
}
