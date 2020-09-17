/* eslint-disable no-param-reassign */
/* eslint-disable operator-assignment */

const promiseStream = require('./promiseStream');

/**
 * This function is called when make pie chart
 * @param {string} strData
 * @return {object}
 */

const calcTotalStep = meta => (meta.period === 0 ? 0 : meta.duration / meta.period);

function makePie(strData) {
  // const { meta, data: speedsPerLinks } = JSON.parse(strData);
  const { meta, data: speedsPerLinks } = strData;
  const labels = [
    '막힘',
    '정체',
    '원할',
  ];
  const backgroundColor = [
    'red',
    'orange',
    'green',
  ];

  const TOTAL_STEP = calcTotalStep(meta);
  const LABEL_SIZE = labels.length;
  const linkIds = Object.keys(speedsPerLinks);

  const filledArray = (value = 0) => size => new Array(size).fill(value);
  const fillArrayZero = filledArray(0);

  const getIndex = (currentStepSpeed) => {
    const index = Math.floor(currentStepSpeed / 15);
    return index >= LABEL_SIZE ? LABEL_SIZE - 1 : index;
  };

  const softmax = (arr) => {
    const totalCount = arr.reduce((acc, value) => acc + value, 0);
    return arr.map(value => Math.round(value * 100 / totalCount));
  };
  const stepDatas = [];
  for (let stepIndex = 0; stepIndex < TOTAL_STEP; stepIndex += 1) {
    const stepData = linkIds.reduce((bucket, linkId) => {
      const linkSpeeds = speedsPerLinks[linkId].values;
      const bucketId = getIndex(linkSpeeds[stepIndex]);
      bucket[bucketId] = bucket[bucketId] + 1;
      return bucket;
    }, fillArrayZero(LABEL_SIZE));

    stepDatas.push(softmax(stepData));
  }

  const summaryData = (() => {
    const summaryData = linkIds.reduce((bucket, linkId) => {
      const linkSpeeds = speedsPerLinks[linkId].values;
      const bucketId = getIndex(linkSpeeds
        .reduce((acc, speed) => acc + speed,
          0) / linkSpeeds.length);
      bucket[bucketId] = bucket[bucketId] + 1;
      return bucket;
    }, fillArrayZero(LABEL_SIZE));
    return softmax(summaryData);
  })();

  return {
    labels,
    backgroundColor,
    stepDatas,
    totalData: summaryData,
  };
}

const driver = (from, simulationId, jsonObj) => new Promise((resolve, reject) => {
  if (!simulationId) {
    return reject(Error('You maybe missed simulation id'));
  }
  const simulationDir = `${from}/${simulationId}`;
  try {
    const fileOrigin = `${simulationDir}/${simulationId}.json`;
    const fileNew = `${simulationDir}/pie-data.json`;

    // promiseStream.fileToString(fileOrigin).then((strData) => {
    const fileData = makePie(jsonObj);
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
