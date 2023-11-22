
/**
 * statistics service api
 */
const router = require('express').Router()

const makeBar = require('./chart-maker/makeBar')
const makeHistogram = require('./chart-maker/makeHistogram')
const makePie = require('./chart-maker/makePie')
const makeGrid = require('./chart-maker/makeGrid')

const chartDataReader = require('./chart-maker/makeChartData')

const { base, saltPath: { output } } = require('../../config')

const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)


// const getChartData = chartDataReader(output)
const getChartData = chartDataReader(`${base}/sim`)



router.use('/', (req, res, next) => {
  const { simulationId } = req.query
  if (!simulationId) {
    res.status(400).end(':( simulationId missed...')
    return
  }
  next()
})

router.get('/summary', async (req, res, next) => {
  const { simulationId } = req.query
  try {
    const data = await getChartData(simulationId, 'bar')
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/histogram', async (req, res, next) => {
  const { simulationId, step } = req.query
  try {
    const {
      labels,
      backgroundColor,
      totalData,
      stepDatas,
    } = await getChartData(simulationId, 'histogram')
    res.json({
      labels,
      datasets: [{
        backgroundColor,
        data: stepDatas[step] || totalData,
      }],
    })
  } catch (err) {
    next(err)
  }
})

router.get('/pie', async (req, res, next) => {
  const { simulationId, step } = req.query

  try {
    res.send(await makePie(getChartData, simulationId, step))
  } catch (err) {
    next(err)
  }
})

/**
 * 시뮬레이션 별로 생성된 그리드 데이터셋 반환
 */
router.get('/grid', async (req, res, next) => {
  const { simulationId } = req.query
  const path = `${base}/sim/${simulationId}/output/grid-data.json`
  try {
    res.send(await readFile(path, 'utf-8'))
  } catch (err) {
    console.log(err.message)
    // next(err)
    res.send({})
  }
})

module.exports = router
