const fs = require('fs')
const util = require('util')
const mkdir = util.promisify(fs.mkdir)

const {
  config
} = require('../../globals')

const { currentTimeFormatted, getRoutes } = require('../../globals')

module.exports = async function create(req, res, next) {
  try {
    await getRoutes()
      .push({
        ...req.body,
        created: currentTimeFormatted(),
      })
      .write()

    mkdir(`${config.base}/route/${req.body.id}`)
    res.send({
      success: true,
      message: 'route created'
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
