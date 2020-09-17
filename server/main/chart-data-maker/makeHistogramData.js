
const promiseStream = require('./promiseStream');

/**
 * This function is called when make histogram
 * @param {string} strData
 * @return {object}
 */

const calcTotalStep = meta => (meta.period === 0
  ? 0
  : meta.duration / meta.period);

function makeHistogram(strData) {
  const filledArray = (value = 0) => size => new Array(size).fill(value);
  // const { meta, data: speedsPerLinks } = JSON.parse(strData);
  const { meta, data: speedsPerLinks } = strData;
  const labels = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    '',
  ];
  const backgroundColorArray = filledArray('rgba(70, 130, 180, 1)');

  const TOTAL_STEP = calcTotalStep(meta);
  const LABEL_SIZE = labels.length;
  const backgroundColor = backgroundColorArray(LABEL_SIZE);

  const linkIds = Object.keys(speedsPerLinks);
  const fillArrayZero = filledArray();

  const getBucketId = (value) => {
    const index = Math.floor(value / 10);
    return index >= LABEL_SIZE ? LABEL_SIZE - 1 : index;
  };

  const stepDatas = [];
  for (let stepIndex = 0; stepIndex < TOTAL_STEP; stepIndex += 1) {
    const stepData = linkIds.reduce((bucket, linkId) => {
      const linkSpeeds = speedsPerLinks[linkId].values;
      const bucketId = getBucketId(linkSpeeds[stepIndex]);
      bucket[bucketId] += 1;
      return bucket;
    }, fillArrayZero(LABEL_SIZE));

    stepDatas.push(stepData);
  }

  const totalData = (() => {
    const summaryData = linkIds.reduce((bucket, linkId) => {
      const linkSpeeds = speedsPerLinks[linkId].values;
      const bucketId = getBucketId(linkSpeeds
        .reduce((sumOfSpeed, speed) => sumOfSpeed + speed,
          0) / linkSpeeds.length);
      bucket[bucketId] = bucket[bucketId] + 1;
      return bucket;
    }, fillArrayZero(LABEL_SIZE));
    return summaryData;
  })();

  return {
    labels,
    backgroundColor,
    stepDatas,
    totalData,
  };
}

const driver = (from, simulationId, jsonObj) => new Promise((resolve, reject) => {
  if (!simulationId) {
    return reject(Error('You maybe missed simulation id'));
  }
  const simulationDir = `${from}/${simulationId}`;
  try {
    const fileOrigin = `${simulationDir}/${simulationId}.json`;
    const fileNew = `${simulationDir}/histogram-data.json`;

    // promiseStream.fileToString(fileOrigin).then((strData) => {
    const fileData = makeHistogram(jsonObj);
    promiseStream.objectToFile(fileNew, fileData)
    .then((result) => {
      console.log(result);
      resolve();
    }).catch(err => reject(err));
  } catch (err) {
    reject(err);
  }
});

module.exports = driver;
