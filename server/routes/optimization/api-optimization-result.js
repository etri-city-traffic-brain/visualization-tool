const createError = require('http-errors')
const fs = require('fs')
const fse = require('fs-extra')

const { config } = require('../../globals')

const baseDir = `${config.base}/data`

const OptResultApp = require('./opt-result')

const app = OptResultApp()

module.exports = async (req, res, next) => {
  const { id } = req.query
  if (!id) {
    next(createError(400, 'id is missed'))
    return
  }

  try {

    const ft = `${baseDir}/${id}/output/simulate/ft_phase_reward_output.txt`
    const rl = `${baseDir}/${id}/output/test/rl_phase_reward_output.txt`

    await fse.access(ft, fs.F_OK)
    await fse.access(rl, fs.F_OK)

    const { reportOp } = await app.makeReports(ft, rl)

    res.send(reportOp)

  } catch (err) {
    console.log(err.message)
    next(createError(500, `fail to read optimization result for ${id}`))
  }
}
