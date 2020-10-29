const fs = require('fs');
const moment = require('moment');
const multer = require('multer');
const path = require('path');

const cookSimulationResult = require('../../main/simulation-manager/cook');

const { getSimulations, updateStatus, currentTimeFormatted } = require('../../globals');

const { saltPath: { output } } = require('../../config');

const prepareDir = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath);
  }
};

/**
 * upload simulation result(csv) by user for convinent
 */
function uploadResult(req, res) {
  const { id } = req.query;
  const targetPath = path.join(output, id);

  prepareDir(targetPath);

  const storage = multer.diskStorage({
    destination: (request, file, callback) => callback(null, targetPath),
    // filename: (request, file, callback) => callback(null, file.originalname),
    filename: (request, file, callback) => callback(null, 'result.csv'),
  });

  const upload = multer({ storage }).single('file');
  upload(req, res, async (err) => {
    if (err) {
      res.statusMessage = 'Error uploading file';
      res.status(404).end();
      return;
    }

    const started = currentTimeFormatted();
    getSimulations()
      .find({ id })
      .assign({ status: 'running', started })
      .write();

    const simulation = getSimulations().find({ id }).value();

    try {
      await cookSimulationResult({
        simulationId: id,
        duration: simulation.configuration.end,
        period: simulation.configuration.period,
      })
      getSimulations()
        .find({ id })
        .assign({
          status: 'finished',
          ended: currentTimeFormatted(),
          error: null,
        })
        .write();

      res.end('File is uploaded');
    } catch (err) {
      getSimulations()
        .find({ id })
        .assign({
          status: 'error',
          ended: currentTimeFormatted(),
          error: `${err.message}, check data file format.`,
        })
        .write();

      res.statusMessage = `${err.message}; invalid data format`;
      res.status(500).end();
    }
  });
}

module.exports = uploadResult;
