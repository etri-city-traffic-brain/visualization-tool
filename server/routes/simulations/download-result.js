const { base } = require('../../config');
const path = require('path');
const fs = require('fs');

function downloadData(req, res) {
  const { id } = req.query;

  const files = fs.readdirSync(path.join(base, 'output', id));
  const simulationResult = files.find(file => file.endsWith('.csv'));

  // const targetFile = path.join(simulationDir, id, 'data.zip');
  res.download(`${base}/output/${id}/${simulationResult}`);
}

module.exports = downloadData;
