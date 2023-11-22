
const util = require('util')
const fs = require('fs')

const rmdir = util.promisify(require('rimraf'))
const exists = util.promisify(fs.exists)

const {
  config,
  getRoutes,
  getRoute,
} = require('../../globals')

const { log } = console

async function remove(req, res) {
  const { params: { id } } = req
  const dir = `${config.base}/route/${id}`

  const r = await getRoute(id)

  if (!r) {
    res.status(404).send({
      message: `not found ${id}`,
    })
  }

  try {
    await getRoutes().remove({ id }).write()
    await exists(dir)
    await rmdir(dir)
    res.send({
      success: true,
      message: `${id} is deleted`,
      id
    })

  } catch (err) {
    console.log(err.message)
    res.status(500).send({ message: err.message })
  }
}

module.exports = remove
