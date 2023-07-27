//    Statistics service API
//    2023

import { HTTP } from '@/http-common'

const uriBase = 'salt/v1/statistics'

const query = (type, sId, step) => `${uriBase}/${type}?simulationId=${sId}&step=${step}`

const { log } = console

async function getSummaryChart(simulationId, step) {
  try {
    const res = await HTTP.get(query('summary', simulationId, step))
    return res.data
  } catch (err) {
    log(err.message)
    return {}
  }
}

function getColor(value, min, max) {
  if (value > max) value = max
  var v = (value - min) / (max - min)
  var hue = ((1 - v) * 120).toString(10)
  return ['hsl(', hue, ',100%,50%)'].join('')
}

async function getHistogramChart(simulationId, step) {
  try {
    const data = await HTTP.get(query('histogram', simulationId, step)).then(res => res.data)
    if (data && data.datasets.length) {
      const xData = data.datasets[0].data
      const backgroundColor = xData.map(data => getColor(data, 0, Math.max(...xData)))
      data.datasets[0].backgroundColor = backgroundColor
    }

    return data
  } catch (err) {
    return {}
  }
}

async function getPieChart(simulationId, step) {
  try {
    return (await HTTP.get(query('pie', simulationId, step))).data
  } catch (err) {
    return null
  }
}

async function getSpeedsPerGrid(simulationId, step) {
  try {
    const { data } = await HTTP.get(query('grid', simulationId, step))
    return data
  } catch (err) {
    return null
  }
}

export default {
  getSummaryChart,
  getHistogramChart,
  getPieChart,
  getSpeedsPerGrid
}
