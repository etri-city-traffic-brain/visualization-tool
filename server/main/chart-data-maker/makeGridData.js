// const process = require('process');
// const {
//   prettyConsole: console,
//   promiseStream: streamUtil,
// } = require('../module/library');


const streamUtil = require('./promiseStream');

// const process = require('process');
const {
  saltPath: {
    output,
  },
} = require('../../config');

const GRID_BASE_FILE = `${output}/grid.geojson`;


function getLowerTen(array, count) {
  return array
    .sort((a, b) => a - b)
    .slice(0, count)
    .reduce((total, cur) => total + cur, 0) / count;
}

/**
 * This function is called when make grid
 * @param {Array<string>} param0
 * @param {string} param0.strDataOrigin
 * @param {string} param0.strDataRefer
 * @return {object}
 */
function makeGrid(strDataOrigin, strDataRefer) {
  // const { meta: { duration, period }, data } = JSON.parse(strDataOrigin);
  const { meta: { duration, period }, data } = strDataOrigin;
  const steps = Math.round(duration / period);
  const grid = JSON.parse(strDataRefer);
  const { features: gridFeatures } = grid;

  const speedAverager = ({ data, steps }) => (linkIds) => {
    const step = new Array(steps).fill(0).map((value, index) => index);
    // const linkCount = linkIds.length;

    // return speed arry by step ex) [10, 20, 10, 11, ...]
    return step.map((stepIndex) => {
      const filtered = linkIds
        .filter(linkId => data[linkId]);
      const count = Math.floor(filtered.length / 10);
      const speeds = filtered.map(linkId => data[linkId].values[stepIndex]);
      return getLowerTen(speeds, count);
    });

    // return step.map(stepIndex => linkIds.reduce((total, linkId) => {
    //   if (!data[linkId]) return total;
    //   return total + data[linkId].values[stepIndex];
    // }, 0) / linkCount);
  };

  const getAvgSpeed = speedAverager({ data, steps });

  return gridFeatures.reduce((bucket, { properties }) => {
    const { GRID_ID, LINKS } = properties;
    const gridInfo = {};
    gridInfo[GRID_ID] = getAvgSpeed(LINKS);
    return Object.assign(bucket, gridInfo);
  }, { steps });
}

const filesToString = (...files) => files.map(file => streamUtil.fileToString(file));

const driver = (from, simulationId, jsonObj) => {
  if (!simulationId) {
    return Promise.reject(Error('You maybe missed simulation id'));
  }
  const simulationDir = `${from}/${simulationId}`;
  try {
    const fileOrigin = `${simulationDir}/${simulationId}.json`;
    // const fileRefer = `${from}/grid.geojson`;
    // console.log('from:', from);
    // const fileRefer = `${from}/grid.geojson`;
    const fileNew = `${simulationDir}/grid-data.json`;
    return new Promise((resolve, reject) => {
      // Promise.all(filesToString(fileOrigin, GRID_BASE_FILE)).then((strDatas) => {
      Promise.all(filesToString(GRID_BASE_FILE)).then((strDatas) => {
        const gridData = makeGrid(jsonObj, ...strDatas);
        return streamUtil.objectToFile(fileNew, gridData);
      }).then((result => resolve(result))).catch(err => reject(err));
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = driver;
// const [localPath, simulationId] = process.argv.slice(2);
// driver(localPath, simulationId)
//   .then(result => prettyConsole.logGreen(result))
//   .catch(err => prettyConsole.logRed(err));
