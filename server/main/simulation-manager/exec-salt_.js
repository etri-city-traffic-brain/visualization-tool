/*!
 * Simulation Runner
 * run traffic simulator on the local file system
 *
 */

const config = require('../../config');
const exec = require('../../sim-runner/exec')

const {
  saltPath: {home, scripts},
} = config;


const { getSimulation } = require('../../globals')
const scenarioFile = 'salt.scenario.json'

module.exports = (simulation) => {

  // const simulation = getSimulation(simulationId)
  const scenarioFilePath = `${home}/data/${simulation.id}/${scenarioFile}`
  const script = `${scripts}/${simulation.configuration.script}`
  const pythonPath = `${home}/tools/libsalt/`

  exec({
    pythonPath,
    script,
    params: ['-s', scenarioFilePath]
  })

}
