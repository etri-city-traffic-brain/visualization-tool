const makeBar = require('./makeBarData')
const makeHistogram = require('./makeHistogramData')
const makePie = require('./makePieData')

const jobs = [
  makeBar,
  makeHistogram,
  makePie
  // makeGrid
]

const { log } = console

const spendTime = (startTime, endTime) =>
  (endTime.getTime() - startTime.getTime()) / 1000

function makeChart(pathLocal, simulationId, jsonObj) {
  return new Promise((resolve, reject) => {
    const startTime = new Date()
    Promise.all(jobs.map(job => job(pathLocal, simulationId, jsonObj)))
      .then(() => {
        const endTime = new Date()
        resolve(spendTime(startTime, endTime))
      })
      .catch(err => {
        log(err.message)
        reject(err)
      })
  })
}
module.exports = makeChart


process.on('message', async function (message) {
  log('[child] start create chart')
  setTimeout(async () => {
    try {
      await makeChart(
        message.pathLocal,
        message.simulationId,
        message.jsonObj
      )
      process.send({ success: true })
    } catch (err) {
      process.send({
        success: false,
        message: err.message
      })
    }
  }, 1000)

})
