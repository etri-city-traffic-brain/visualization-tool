const path = require('path');
const fs = require('fs');
const { base } = require('../../config');

function downloadData(req, res) {
  const { id } = req.query;

  const files = fs.readdirSync(path.join(base, 'output', id));
  const simulationResult = files.find(file => file.endsWith('.csv'));

  res.download(`${base}/output/${id}/${simulationResult}`);
}

module.exports = downloadData;
