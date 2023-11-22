const createError = require('http-errors')
const fs = require('fs')

const { config } = require('../../globals')

module.exports = async (req, res, next) => {
  const path = `${config.base}/data/scenario/scenario.json`

  try {
    const text = fs.readFileSync(path)
    res.send(JSON.parse(text))
  } catch (err) {
    next(err)
  }

}
