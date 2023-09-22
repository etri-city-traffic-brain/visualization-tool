const createError = require('http-errors')
const fs = require('fs')
const { extractSignalGroups } = require('../../cli/signal-group')
const { config } = require('../../globals')

module.exports = async (req, res, next) => {
  const region = req.params.region

  if (!region) {
    next(createError(400, 'invalid region'))
  }

  const path = `${config.base}/data/scenario/${region}/${region}.tss.xml`

  try {
    const groups = extractSignalGroups(path)
    res.send(Object.keys(groups))
  } catch (err) {
    next(err)
  }
}
