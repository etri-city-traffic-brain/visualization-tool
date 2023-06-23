const fs = require('fs')

const {
  saltPath: { output }
} = require('../../config')


module.exports = (req, res) => {
  const grid = JSON.parse(fs.readFileSync(`${output}/grid_.geojson`, 'utf-8'))
  res.json(grid)
}
