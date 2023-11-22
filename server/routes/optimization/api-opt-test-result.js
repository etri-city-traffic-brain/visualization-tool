
const fs = require('fs')
const util = require('util')
const createError = require('http-errors')

const calcOptTrainResult = require('../../cli/opt-result/stats-by-tl')
const { config } = require('../../globals')

const readdir = util.promisify(fs.readdir)

module.exports = async (req, res, next) => {
  const { id, epoch } = req.query
  if (!id) {
    next(createError(400, 'id is missed'))
    return
  }

  const dir = `${config.base}/opt/${id}/output/test/`

  try {
    const files = await readdir(dir)
    if (files.length === 0) {
      res.send({
        result: []
      })
      return
    }

    const filtered = files.filter(file => file.endsWith(epoch + '.csv'))

    if (filtered.length === 0) {
      res.send([])
      return
    }

    // pick first file
    const result = await calcOptTrainResult(`${dir}/${filtered[0]}`)

    res.send({ result })
  } catch (err) {
    console.log(err.message)
    res.send({
      result: []
    })
  }
}
