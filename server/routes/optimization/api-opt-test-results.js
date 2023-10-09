
const fs = require('fs')
const util = require('util')
const createError = require('http-errors')

const { config } = require('../../globals')

const readdir = util.promisify(fs.readdir)

module.exports = async (req, res, next) => {
  const { id } = req.query
  if (!id) {
    next(createError(400, 'id is missed'))
    return
  }

  const dir = `${config.base}/opt/${id}/output/test/`

  try {
    const files = await readdir(dir)
    if (files.length === 0) {
      res.send([])
      return
    }

    const filtered = files.filter(file => file.startsWith('_state'))
    if (filtered.length === 0) {
      res.send([])
      return
    }

    const result = filtered.map(v => {
      return v.substring(v.lastIndexOf('_') + 1, v.lastIndexOf('.'))
    })

    res.send(result)
  } catch (err) {
    console.log(err.message)
    res.send([])
  }
}
