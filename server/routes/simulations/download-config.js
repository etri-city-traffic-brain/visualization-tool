const { base } = require('../../config');

function downloadConfig(req, res) {
  const { id } = req.query;
  res.download(`${base}/data/${id}/salt.scenario.json`);
}

module.exports = downloadConfig;
