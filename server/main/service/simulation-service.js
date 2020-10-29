
const axios = require('axios')

async function notifySimulationFinished(simulationId) {
  return axios({
    url:`http://localhost/salt/v1/status?id=${simulationId}&status=finished`,
    method: 'POST'
  })
}

module.exports = {
  notifySimulationFinished
}
