import { HTTP } from '@/http-common'
import moment from 'moment'

async function getSimulationInfo (simulationId) {
  try {
    const { data: simulation } = await HTTP.get(`/salt/v1/simulations/get/${simulationId}`)
    const {
      period,
      fromDate,
      fromTime,
      toDate,
      toTime
    } = simulation.configuration
    // console.log(begin, end, period);
    // const slideMax = (end - begin) / period + (60 / period);
    const timeDiff = moment(`${toDate} ${toTime}`).diff(moment(`${fromDate} ${fromTime}`))

    const slideMax = Math.ceil(timeDiff / (period * 1000)) - 1 // unit: miliseconds
    return {
      simulation,
      slideMax,
      ticks: slideMax + 1
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return {
      simulation: null,
      slideMax: -1
    }
  }
}

async function startSimulation (simulationId) {
  return HTTP.post(`/salt/v1/simulations/start?id=${simulationId}`)
}

async function stopSimulation (simulationId) {
  return HTTP.post(`/salt/v1/simulations/stop/${simulationId}`)
}

async function getSimulations (userId, currentPage) {
  return HTTP.get(`/salt/v1/simulations/?page=${currentPage}&user=${userId}`)
}

async function getOptimizations (userId, currentPage) {
  return HTTP.get(`/salt/v1/simulations/?page=${currentPage}&user=${userId}&type=optimization`)
}

async function uploadResult (item, formData) {
  return HTTP.post(`/salt/v1/simulations/upload/result?id=${item.id}&map=${item.configuration.map}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

async function createSimulation (userId, obj) {
  return HTTP.post('/salt/v1/simulations/create', obj)
}

async function remove (simulationId) {
  return HTTP.delete(`/salt/v1/simulations/remove/${simulationId}`)
}

const query = ({ min, max, zoom }) => `extent=[${min.x},${min.y},${max.x},${max.y}]&zoom=${zoom}`

async function getSimulationResult (simulationId, extent) {
  return (await HTTP.get(`/salt/v1/simulation/${simulationId}?${query(extent)}`)).data
}

async function getScripts () {
  return (await HTTP.get('/salt/v1/simulations/scripts')).data
}

async function downloadScenario (id) {
  return (await HTTP.get('/salt/v1/simulations/download/data?id=' + id))
}

async function downloadScenarioConfig (id) {
  return (await HTTP.get('/salt/v1/simulations/download/config?id=' + id))
}

async function getValueByLinkOrCell (simulationId, linkOrCellId, valueType) {
  return (await HTTP.get(`/salt/v1/simulation/result/${simulationId}/${linkOrCellId}?type=${valueType}`)).data
}

export default {
  downloadScenario,
  downloadScenarioConfig,
  createSimulation,
  remove,
  getSimulationInfo,
  getSimulationResult,
  startSimulation,
  stopSimulation,
  getSimulations,
  getOptimizations,
  uploadResult,
  getScripts,

  getValueByLinkOrCell
}
