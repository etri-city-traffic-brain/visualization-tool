const {
  simulation: {
    data,
  },
} = require('../../config');

const {
  downloadScenarioByCoordinate,
  downloadScenarioByRegion,
} = require('../../main/service/scenario-downloader');

/**
 * download simulation scenario from data server
 * const {
 * reqDate,
 * fromTime,
 * toTime,
 * minX,
 * minY,
 * maxX,
 * maxY,
 * } = req.query;
 */

async function handleDownloadScenarioByCoordinate(req, res) {
  const { query } = req;
  try {
    const targetPath = await downloadScenarioByCoordinate(query, data);
    console.log(targetPath);
    res.download(targetPath, () => {
      // fs.unlink(targetPath);
    });
  } catch (error) {
    res.status(500).end();
  }
}

async function handleDownloadScenarioByRegion(req, res) {
  const { query } = req;
  try {
    const targetPath = await downloadScenarioByRegion(query, data);
    res.download(targetPath, () => {
      // fs.unlink(targetPath);
    });
  } catch (error) {
    res.status(500).end();
  }
}

module.exports = {
  handleDownloadScenarioByCoordinate,
  handleDownloadScenarioByRegion,
};
