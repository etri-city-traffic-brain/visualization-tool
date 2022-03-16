/* eslint-disable no-await-in-loop */

/**
 * add simulation result to MongoDB collection
 * and generate statistical chart data
 *
 * author: Yeonheon Gu
 * modified: 2020-09-17
 */
const debug = require('debug')('api:simulation-result')

const fs = require('fs')
const csv = require('fast-csv')

const status = require('./simulatoin-status')
const { currentTimeFormatted, updateStatus } = require('../../globals')

const makeChartData = require('../chart-data-maker')
const recordResult = require('./insert-to-mongo')
debug('xxxx')
const config = require('../../config')
const { output } = config.saltPath

const subIds = (cellId) => {
  const subIds = cellId.split('_')
  return {
    linkId: subIds[0],
    sectionId: `${subIds[0]}_${subIds[1]}`,
    cellId
  }
}

const pickResultFile = id => {
  const file = fs.readdirSync(`${output}/${id}`).find(file => file.endsWith('.csv'))
  if (!file) return null
  return `${output}/${id}/${file}`
}

const cook = ({ simulationId, duration, period }) => {
  updateStatus(simulationId, 'processing')
  debug('Start cooking simulation result', simulationId)
  console.log('start cooking....')
  if (!simulationId) {
    return Promise.reject(new Error('simulation id missed'))
  }

  const simulationResultFile = pickResultFile(simulationId)
  debug('source:', simulationResultFile)
  if (!simulationResultFile) {
    return Promise.reject(new Error('simulation result file(csv) not found...'))
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(simulationResultFile)
    const transform = ([start, end, id, vehPassed, speed, avgDensity, waitingLength, waitingTime, sumTravelLength, sumTravelTime]) =>
      ({ start, id, speed, sumTravelTime, vehPassed, waitingTime })

    const cells = {}
    const start = Date.now()

    const handleData = (row) => {
      // salt specific annotation
      // we have to ignore it
      if (row.id && row.id === 'simulation') {
        return
      }
      const { linkId, cellId } = subIds(row.id)

      const cell = cells[cellId] || {}
      const speed = Number((+row.speed).toFixed(1))
      if (speed >= 0) {
        cell.linkId = linkId
        cell.cellId = cellId
        cell.values = cell.values || []
        cell.travelTimes = cell.travelTimes || []
        cell.vehPassed = cell.vehPassed || []
        cell.waitingTime = cell.waitingTime || []

        cell.values.push(speed)
        cell.travelTimes.push(Number(row.sumTravelTime))
        cell.vehPassed.push(Number(row.vehPassed))
        cell.waitingTime.push(Number(row.waitingTime))
        cells[cellId] = cell
      }
    }

    const handleEnd = async () => {
      stream.close()
      try {
        debug('==> insert into DB')
        await recordResult(simulationId, cells)
        debug('insert mongo end')
        const elapsedTime = await makeChartData(output, simulationId, {
          meta: {
            duration,
            period
          },
          data: cells
        })
        debug('😀 chart data created, elapsedTime:', elapsedTime)

        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024
        debug(`The job uses approximately ${Math.round(memoryUsed * 100) / 100} MB`)
        debug(`${(Date.now() - start) / 1000} sec`)

        updateStatus(simulationId, status.FINISHED, { ended: currentTimeFormatted() })
        resolve(true)
      } catch (err) {
        updateStatus(simulationId, status.ERROR, { error: err.message, ended: currentTimeFormatted() })
        debug(err.message)
        reject(err)
      }
    }

    const handleError = err => reject(err)

    csv
      .fromStream(stream)
      .transform(transform)
      .on('data', handleData)
      .on('end', handleEnd)
      .on('error', handleError)
  })
}

module.exports = cook
