
const util = require('util')
const fs = require('fs')
const rmdir = util.promisify(require('rimraf'))
const exists = util.promisify(fs.exists)

const { config, getSimulations, getSimulation } = require('../../globals')

const removeSimulation = require('../../main/simulation-manager/crud/remove')

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
    await removeSimulation(id)
    res.send({ id })
  }
}

module.exports = remove
