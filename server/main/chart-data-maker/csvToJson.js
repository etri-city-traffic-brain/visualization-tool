const fs = require('fs');
// const {
//   promiseStream,
// } = require('../module/dprecated/library');

const promiseStream = require('./promiseStream');
/**
 * This function is called when make indexer
 * @param {Array<string>} columnRow
 * @return {object}
 */
function makeIndexer(columnRow) {
  const defaultIndex = {
    BEGIN: 0,
    END: 1,
    ID: 2,
    AVGSPEED: 4,
  };
  const {
    intervalbegin,
    intervalend,
    roadID,
    AverageSpeed,
    avgspeed,
  } = (firstRow => firstRow
    .reduce((acc, column, index) => {
      acc[column] = index;
      return acc;
    }, {})
  )(columnRow);

  return {
    intervalBegin: intervalbegin || defaultIndex.BEGIN,
    intervalEnd: intervalend || defaultIndex.END,
    linkId: roadID || defaultIndex.ID,
    avgSpeed: AverageSpeed || avgspeed || defaultIndex.AVGSPEED,
  };
}

/**
 * This function is called when initialize meta
 * @param {Array<string>} rows
 * @param {object} param1
 * @param {Number} param1.intervalBegin
 * @param {Number} param1.intervalEnd
 * @return {object}
 */
function metaInit(rows, { intervalBegin, intervalEnd }) {
  // console.log(intervalBegin, intervalEnd);
  const firstRow = rows[0];
  const finalRow = rows[rows.length - 1];
  return {
    duration: Math.round(
      (finalRow[intervalEnd] - firstRow[intervalBegin]) / 60,
    ),
    period: Math.round(
      (firstRow[intervalEnd] - firstRow[intervalBegin] + 1) / 60,
    ),
  };
}

/**
 * This function is called when parse csv to json
 * @param {string} strData
 * @return {object}
 */
function makeJson(strData) {
  const fileRows = strData.split('\n')
    .filter(str => str !== '')
    .map(line => line.split(','));
  const columnRow = fileRows[0];
  const dataRows = fileRows.slice(1);

  const indexer = makeIndexer(columnRow);
  const meta = metaInit(dataRows, indexer);
  const data = ((meta, indexer) => (dataRows) => {
    const data = dataRows.reduce((acc, row) => {
      const SIZE = Math.floor(meta.duration / meta.period);
      if (Number.isNaN(SIZE)) {
        return 0;
      }

      // console.log('SIZE:', SIZE);
      const index = Math.floor(row[indexer.intervalEnd] / meta.period / 60);
      if (index === SIZE) return acc;

      const linkId = Number(row[indexer.linkId]);
      if (Number.isNaN(linkId)) return acc;

      const avgSpeed = Number(row[indexer.avgSpeed]);
      if (acc[linkId] === undefined) acc[linkId] = new Array(SIZE);
      if (acc[linkId][0] === undefined) acc[linkId][0] = avgSpeed;
      acc[linkId][index] = avgSpeed;
      return acc;
    }, {});

    const linkIds = Object.keys(data);
    return linkIds.reduce((acc, linkId) => {
      const fixedData = (dataLink, index = 0) => {
        if (index === dataLink.length) return dataLink;
        if (dataLink[index] === undefined) {
          dataLink[index] = dataLink[index - 1];
        }
        return fixedData(dataLink, index + 1);
      };
      acc[linkId] = fixedData(data[linkId]);
      return acc;
    }, {});
  }
  )(meta, indexer);

  return {
    meta,
    data: data(dataRows),
  };
}

module.exports = (targetPath, simulationId) => new Promise((resolve, reject) => {
  if (!simulationId) {
    return reject(Error('You maybe missed simulation id'));
  }
  const simulationDir = `${targetPath}/${simulationId}`;
  try {
    const fileName = fs.readdirSync(`${simulationDir}`).find(file => file.endsWith('.csv'));
    console.log(fileName);
    const fileOrigin = `${simulationDir}/${fileName}`;
    const fileNew = `${simulationDir}/${simulationId}.json`;
    promiseStream.fileToString(fileOrigin)
      .then((str) => {
        const fileData = makeJson(str);
        return promiseStream.objectToFile(fileNew, fileData);
      })
      .then(result => resolve(result))
      .catch(err => reject(err));
  } catch (e) {
    reject(e);
  }
});
