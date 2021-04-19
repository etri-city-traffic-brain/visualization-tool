
const makeBar = require('./makeBarData')
const makeHistogram = require('./makeHistogramData')
const makePie = require('./makePieData')
const makeGrid = require('./makeGridData')

const jobs = [
  makeBar,
  makeHistogram,
  makePie,
  makeGrid
]

const { log } = console

const spendTime = (startTime, endTime) => (endTime.getTime() - startTime.getTime()) / 1000

module.exports = (pathLocal, simulationId, jsonObj) => new Promise((resolve, reject) => {
  const startTime = new Date()
  // log('started at', startTime)
  Promise.all(jobs.map(job => job(pathLocal, simulationId, jsonObj)))
    .then(() => {
      const endTime = new Date()
      // log('finished at', endTime)
      resolve(spendTime(startTime, endTime))
    })
    .catch((err) => {
      log(err.message)
      reject(err)
    })
})
