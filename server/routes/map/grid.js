const fs = require('fs')

const {
  saltPath: { output }
} = require('../../config')

const grid = JSON.parse(fs.readFileSync(`${output}/grid_.geojson`, 'utf-8'))

module.exports = (req, res) => {
  res.json(grid)
}
