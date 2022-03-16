const { base } = require('../../config')

function downloadData (req, res) {
  const { id } = req.query
  // const targetFile = path.join(simulationDir, id, 'data.zip');
  console.log('download', id)
  res.download(`${base}/data/${id}/data.zip`)
}

module.exports = downloadData
