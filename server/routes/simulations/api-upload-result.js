const fs = require('fs');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const dbUtils = require('../../main/dbms/db-utils');
const cookSimulationResult = require('../../main/simulation-manager/simulation-result-cooker');

const { getSimulations } = require('../../globals');

const { saltPath: { output } } = require('../../config');

const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);

function getCurrentTimeFormatted() {
  return moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
}

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

    const started = getCurrentTimeFormatted();
    getSimulations()
      .find({ id })
      .assign({ status: 'running', started })
      .write();

    const simulation = getSimulations().find({ id }).value();

    try {
      await cookSimulationResult({
        id,
        duration: simulation.configuration.end,
        period: simulation.configuration.period,
      }, (status, text) => {
        updatetStatus(id, status, text);
      });
      getSimulations()
        .find({ id })
        .assign({
          status: 'finished',
          ended: getCurrentTimeFormatted(),
          error: null,
        })
        .write();

      res.end('File is uploaded');
    } catch (err) {
      getSimulations()
        .find({ id })
        .assign({
          status: 'error',
          ended: getCurrentTimeFormatted(),
          error: `${err.message}, check data file format.`,
        })
        .write();

      res.statusMessage = `${err.message}; invalid data format`;
      res.status(500).end();
    }
  });
}

module.exports = uploadResult;
