
const streamUtil = require('./promiseStream');

/**
 * This function is called when make bar chart
 * @param {string} strData
 * @return {object}
 */
function makeBar(strData) {
  const { meta, data } = strData;
  // console.log(data)
  const formater = value => ((value < 10) ? `0${value}` : `${value}`);

  let labelValue = 0;
  const labels = [];
  const {
    period,
    duration,
  } = meta;

  while (labelValue < duration) {
    const hour = formater(Math.floor(labelValue / 3600));
    const min = formater(Math.floor((labelValue % 3600) / 60));
    labels.push(`${hour}:${min}\n(${Math.floor(labelValue / period)})`);
    labelValue += period;
  }
  const SIZE = labels.length;

  const getColor = (avgSpeed) => {
    if (avgSpeed < 15) return 'red';
    if (avgSpeed < 30) return 'yellow';
    return 'green';
  };

  const getAvgSpeed = (linkIds, index) => linkIds.reduce((acc, linkId) => acc + data[linkId].values[index], 0) / linkIds.length;

  const linkIds = Object.keys(data);
  const dataset = { backgroundColor: [], data: [] };
  for (let index = 0; index < SIZE; index += 1) {
    const avgSpeed = getAvgSpeed(linkIds, index);
    dataset.backgroundColor.push(getColor(avgSpeed));
    dataset.data.push(Number(avgSpeed.toFixed(2)));
    console.log('push', avgSpeed)
  }
  const datasets = [
    dataset,
  ];
  return {
    labels,
    datasets,
  };
}

const driver = (from, simulationId, jsonObj) => new Promise((resolve, reject) => {
  if (!simulationId) {
    return reject(Error('You maybe missed simulation id'));
  }
  const simulationDir = `${from}/${simulationId}`;
  try {
    const fileNew = `${simulationDir}/bar-data.json`;
    // streamUtil.fileToString(fileOrigin).then((strData) => {
    const fileData = makeBar(jsonObj);
    streamUtil.objectToFile(fileNew, fileData)
      .then((result) => {
        console.log(result);
        resolve();
      }).catch(reject);
  } catch (err) {
    reject(err);
  }
});

module.exports = driver;
