/* eslint-disable no-await-in-loop */

/**
 * add simulation result to MongoDB collection
 * and generate statistical chart data
 *
 * author: Yeonheon Gu
 * modified: 2023-07-26
 */
const debug = require('debug')('api:simulation-result')
const { fork } = require('child_process')
const fs = require('fs')
const readline = require('readline')

const status = require('./simulatoin-status')
const { currentTimeFormatted, updateStatus } = require('../../globals')

const makeChartData = require('../chart-data-maker')
// const recordResult = require('./insert-to-mongo')

const config = require('../../config')
const { output } = config.saltPath

const subIds = cellId => {
  const subIds = cellId.split('_')
  return {
    linkId: subIds[0],
    sectionId: `${subIds[0]}_${subIds[1]}`,
    cellId
  }
}

const pickResultFile = id => {
  const file = fs
    .readdirSync(`${output}/${id}`)
    .find(file => file.endsWith('.csv'))
  if (!file) return null
  return `${output}/${id}/${file}`
}

function printMemoryUsage() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024
  const mb = Math.round(used * 100) / 100
  debug(`Memory Usage approximately ${mb} MB`)
}

function runBulkInsert(simulationId, cells) {

  return new Promise((resolve, reject) => {
    const child = fork('./insert-to-mongo.js')

    child.send({
      collectionName: simulationId,
      cells
    })

    child.on('message', (message) => {
      debug('[bulk insert]')
      if (message.success) {
        resolve(true)
        return
      }
      reject(new Error('fail to insert bulk'))
    })

  })
}

function runMakeChart(pathLocal, simulationId, jsonObj) {
  return new Promise((resolve, reject) => {
    const c2 = fork('../chart-data-maker')
    c2.send({
      pathLocal,
      simulationId: simulationId,
      jsonObj
    })
    c2.on('message', (message) => {
      debug('[chart marker]')
      if (message.success) {
        resolve(true)
        return
      }
      reject(new Error('fail to create chart'))
    })
  })
}

function cook({ simulationId, duration, period }) {
  updateStatus(simulationId, 'processing')
  debug('start cooking simulation result ', simulationId)
  if (!simulationId) {
    return Promise.reject(new Error('simulation id missed'))
  }

  const simulationResultFile = pickResultFile(simulationId)
  debug('target file:', simulationResultFile)
  if (!simulationResultFile) {
    return Promise.reject(new Error('simulation result file(csv) not found...'))
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(simulationResultFile)
    const cells = Object.create(null)
    let cnt = 0
    const start = Date.now()
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    })

    rl.on('line', (line) => {
      const [start,
        end,
        id,
        vehPassed,
        speed,
        avgDensity,
        waitingLength,
        waitingTime,
        sumTravelLength,
        sumTravelTime] = line.split(',')

      cnt += 1

      if (cnt === 1) { // ignore first line
        return
      }

      if (id === 'simulation') { // ignore salt specific label
        return
      }

      const { linkId, cellId } = subIds(id)

      const cell = cells[cellId] || {}

      cell.linkId = linkId
      cell.cellId = cellId

      cell.values = cell.values || []
      cell.travelTimes = cell.travelTimes || []
      cell.vehPassed = cell.vehPassed || []
      cell.waitingTime = cell.waitingTime || []

      cell.values.push(Number((speed)))
      cell.travelTimes.push(Number(sumTravelTime))
      cell.vehPassed.push(Number(vehPassed))
      cell.waitingTime.push(Number(waitingTime))

      cells[cellId] = cell

    })

    rl.on('close', async () => {
      debug(`finished generating statistics per cell ${Date.now() - start / 1000}ms`)
      try {
        // await recordResult(simulationId, cells)
        // const elapsedTime = await makeChartData(output, simulationId, {
        //   meta: {
        //     duration,
        //     period
        //   },
        //   data: cells
        // })

        const result = await Promise.all([
          runBulkInsert(simulationId, cells),
          runMakeChart(output, simulationId, {
            meta: {
              duration,
              period
            },
            data: cells
          })
        ])
        // debug(result)

        printMemoryUsage()
        debug(`${(Date.now() - start) / 1000} sec`)

        updateStatus(simulationId, status.FINISHED, {
          ended: currentTimeFormatted()
        })
        resolve(true)
      } catch (err) {
        updateStatus(simulationId, status.ERROR, {
          error: err.message,
          ended: currentTimeFormatted()
        })
        debug(err.message)
        reject(err)
      }
    })
  })
}

module.exports = cook
