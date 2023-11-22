
const util = require('util')
const fs = require('fs')
const rmdir = util.promisify(require('rimraf'))
const exists = util.promisify(fs.exists)

const {
  config,
  getSimulations,
  getSimulation,
  mongooseUtils
} = require('../../globals')

const { log } = console

async function remove(req, res) {
  const { params: { id } } = req

  const sim = await getSimulation(id)

  if (!sim) {
    res.status(404).send({
      message: `not found ${id}`,
    })
  }

  if (sim.type === 'optimization') {
    const optDir = `${config.base}/opt/${id}`
    try {
      await getSimulations().remove({ id }).write()
      await exists(optDir)
      await rmdir(optDir)
      res.send({ id })
    } catch (err) {
      console.log(err.message)
      res.status(500).send({ message: err.message })
    }
    return
  }

  if (sim.type === 'simulation') {
    const optDir = `${config.base}/sim/${id}`

    try {
      await getSimulations().remove({ id }).write()
      await exists(optDir)
      await rmdir(optDir)
    } catch (err) {
      log(err.message)
    }

    try {
      await mongooseUtils.dropCollection('simulation_results', id)
    } catch (err) {
      log(err.message)
    }

    res.send({ id })
  }
}

module.exports = remove
