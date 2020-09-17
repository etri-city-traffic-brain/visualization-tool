
const path = require('path');

const {
  db: { getSimulations },
  config: { saltPath: { output } },
} = global.SALT;

async function getSimulationResult(req, res) {
  const { params: { id } } = req;

  const obj = getSimulations().find({ id }).value();
  if (!obj) {
    res.status(404).end();
    return;
  }

  const mapType = obj.configuration.map;
  const fileName = [mapType, 'speeds', 'json'].join('.');

  // const filePath = path.join(simulationDir, id, fileName);
  // /salt/output/{simulation_id}/link.speeds.json
  const filePath = path.join(output, id, fileName);
  res.download(filePath, fileName);
}

module.exports = getSimulationResult;


