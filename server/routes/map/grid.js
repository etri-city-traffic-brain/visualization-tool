const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)

const {
  base
} = require('../../config')


module.exports = async (req, res) => {
  try {
    const grid = await readFile(`${base}/data/grid_.geojson`, 'utf-8')
    res.send(grid)
  } catch (err) {
    res.send({})
    console.log(err.message)
  }
}
