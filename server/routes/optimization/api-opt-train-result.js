
const createError = require('http-errors')
const calcOptTrainResult = require('../../cli/opt-result/stats-by-tl')
const { config } = require('../../globals')

const fs = require('fs')

module.exports = async (req, res, next) => {
  const { id, epoch } = req.query
  if (!id) {
    next(createError(400, 'id is missed'))
    return
  }

  const dir = `${config.base}/opt/${id}/output/train/${epoch}`

  try {
    const files = fs.readdirSync(dir)
    if (files.length === 0) {
      res.send([])
      return
    }

    const result = await calcOptTrainResult(`${dir}/${files[0]}`)
    console.log(result)

    res.send(result)
  } catch (err) {
    console.log(err.message)
    res.send([])
  }


  // res.send([
  //   {
  //     name: '상대초교(단)',
  //     SA: 'SA 101',
  //     ftVehPassed: 2778,
  //     ftAvgTravelTime: 10.81,
  //     rlAvgTravelTime: 12.68,
  //     improvedRate: -17.36
  //   },
  //   {
  //     name: '원골(단)',
  //     SA: 'SA 101',
  //     ftVehPassed: 2838,
  //     ftAvgTravelTime: 38.01,
  //     rlAvgTravelTime: 28.83,
  //     improvedRate: 24.15
  //   }

  // ])
}
