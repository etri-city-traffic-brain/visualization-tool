/**
 * download scenario
 *
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const {
  scenarioService: {
    urlBaseForScenarioByRegion,
    urlBaseForScenarioByCoordinate,
  },
} = require('../../config');

async function download(url, targetDir = './') {
  console.log('download');
  const targetFilePath = path.resolve(targetDir, 'data.zip');

  try {
    const { data } = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
    });

    data.pipe(fs.createWriteStream(targetFilePath));

    return new Promise((resolve, reject) => {
      data.on('end', () => {
        const stats = fs.statSync(targetFilePath);
        if (stats.size < 100) {
          reject(new Error('scenario file is not correct'));
          return;
        }
        resolve(targetFilePath);
      });
      data.on('error', error => reject(error));
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

function makeUrlForScenarioByRegion({
  include = 0,
  fromDate,
  toDate,
  fromTime,
  toTime,
  region,
  subregion,
  partitions,
  signal = 0,
  route = 0,
  event = 0,
  weather = 0,
}) {
  const reqestParameter = `
  ?include=${include}&
  fromDate=${fromDate}&
  toDate=${toDate}&
  fromTime=${fromTime}&
  toTime=${toTime}&
  region=${region}&
  subregion=${subregion}&
  partitions=${partitions}&
  signal=${signal}&
  route=${route}&
  event=${event}&
  weather=${weather}&`.replace(/\s/g, '');
  return `${urlBaseForScenarioByRegion}${reqestParameter}`;
}

function makeUrlForScenarioByCoordinate({
  include = 0,
  fromDate,
  toDate,
  fromTime,
  toTime,
  minX,
  minY,
  maxX,
  maxY,
  partitions = '1',
  signal = '0',
  route = '0',
  event = '0',
  weather = '0',
}) {
  const reqestParameter = `
  ?include=${include}&
  fromDate=${fromDate}&
  toDate=${toDate}&
  fromTime=${fromTime}&
  toTime=${toTime}&
  minX=${minX}&
  minY=${minY}&
  maxX=${maxX}&
  maxY=${maxY}&
  partitions=${partitions}&
  signal=${signal}&
  route=${route}&
  event=${event}&
  weather=${weather}&`.replace(/\s/g, '');

  return `${urlBaseForScenarioByCoordinate}${reqestParameter}`;
}

async function downloadScenarioByRegion(param, targetDir) {
  return download(makeUrlForScenarioByRegion(param), targetDir);
}

async function downloadScenarioByCoordinate(param, targetDir) {
  return download(makeUrlForScenarioByCoordinate(param), targetDir);
}

module.exports = {
  download,
  makeUrlForScenarioByRegion,
  makeUrlForScenarioByCoordinate,
  downloadScenarioByRegion,
  downloadScenarioByCoordinate,
};
