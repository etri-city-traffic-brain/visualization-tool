/* eslint-disable no-await-in-loop */


/**
 * add simulation result to mongo db collection
 *
 * author: Yeonheon Gu
 *
 */
const debug = require('debug')('api:simulation-result');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const moment = require('moment');

const util = require('util');

const writeFile = util.promisify(fs.writeFile);

const currentTime = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
const makeChartData = require('../main/chart-data-maker');

const {
  mongoose,
  config: {
    saltPath: {
      output,
    },
  },
  mongooseUtils: {
    isConnected,
  },
} = global.SALT;

const { join } = path;
const { log, error } = console;

/**
 *
 * @param {String} idStr [linkId][sectionId][laneId]
 */
// const parseRoadId_0 = (idStr) => {
//   const groups = idStr.match(/\[-?[0-9]*\]/gi);
//   return groups.map(v => v.replace(/\[/gi, '').replace(/\]/gi, ''));
// };

const parseRoadId = (idStr = '') => idStr.split('_');

const getIds = (columnName) => {
  const ids = parseRoadId(columnName);
  const get = idx => ids[idx] || '0';
  return {
    linkId: get(0),
    sectionId: `${get(0)}_${get(1)}`,
    cellId: `${get(0)}_${get(1)}_${get(2)}`,
  };
};

const insertToMongo = async (collectionName, dataTable, updateStatus) => {
  if (!isConnected(mongoose)) {
    throw new Error('MongoDB not connected');
  }
  const db = mongoose.connection.useDb('simulation_results');
  try {
    await db.collection(collectionName).drop();
  } catch (err) {
    // ignore
  }

  const collection = db.collection(collectionName);
  await collection.createIndex({ cellId: 1 });
  debug('start bulk insert');
  let bulk = collection.initializeOrderedBulkOp();
  const list = Object.keys(dataTable);
  for (let i = 0; i < list.length; i += 1) {
    const id = list[i];
    const target = dataTable[id];
    bulk.insert({
      linkId: target.linkId,
      cellId: target.cellId,
      values: target.values,
    });
    if (i % 1000 === 0) {
      await bulk.execute();
      updateStatus(`insert ${i}`);
      bulk = collection.initializeOrderedBulkOp();
    }
  }
  await bulk.execute();
  debug('finish bulk insert');
};

// const getSimulationFileName = simulationId => fs.readdirSync(join(output, simulationId)).find(file => file.endsWith('unified.csv') || file.endsWith('.csv'));
const getSimulationFileName = (simulationId) => {
  const files = fs.readdirSync(join(output, simulationId));
  let target = files.find(file => file.endsWith('unified.csv'));
  if (!target) {
    target = files.find(file => file.endsWith('.csv'));
  }
  return target;
};
/**
 * 시뮬레이션 결과를 시각화 용도에 맞도록 변환한다.
 * salt result file location: {baseDir}/{simulationId}/{fileName}.csv
 *
 * @param {String}} simulationId
 */
function cook({ id: simulationId, duration, period }, updateStatus) {
  debug('start cooking', simulationId);
  if (!simulationId) {
    return Promise.reject(new Error('simulation id missed'));
  }
  const outputPath = join(output, simulationId);

  return new Promise((resolve, reject) => {
    const simulationResultFile = getSimulationFileName(simulationId);

    if (!simulationResultFile) {
      return reject(new Error('simulation result file(csv) not found...'));
    }
    const stream = fs.createReadStream(join(outputPath, simulationResultFile));
    const transform = ([start, , id, , speed]) => ({ start, id, speed });

    const cellMap = {};
    const start = Date.now();
    let count = 0;
    const handleData = (row) => {
      if (row.id && row.id === 'simulation') return;
      // const cellId = `${row.id}_0_0`;
      count += 1;
      if (count % 10000 === 0) {
        updateStatus(`processing: ${count / 1000}k`);
      }
      const { linkId, cellId } = getIds(row.id);

      const cell = cellMap[cellId] || {};
      const speed = Number((+row.speed).toFixed(1));
      cell.values = cell.values || [];
      cell.values.push(speed);
      cell.linkId = linkId;
      cell.cellId = cellId;
      if (speed) {
        cellMap[cellId] = cell;
      }
    };

    const handleEnd = async () => {
      try {
        // await makeChartData(output, simulationId);
        await insertToMongo(simulationId, cellMap, updateStatus);
        debug(`write file to ${output}/${simulationId}/${simulationId}.json`);
        // await writeFile(`${output}/${simulationId}/${simulationId}.json`, JSON.stringify({
        //   meta: {duration, period},
        //   data: cellMap,
        // }), 'utf-8')

        await makeChartData(output, simulationId, {
          meta: {
            duration,
            period,
          },
          data: cellMap,
        });

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        debug(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
        debug(`${(Date.now() - start) / 1000} sec`);
        updateStatus('finished', {
          ended: currentTime(),
        });
        resolve(true);
      } catch (err) {
        updateStatus('error', {
          error: err.message,
          ended: currentTime(),
        });
        error(err);
        reject(err);
      }
    };

    csv
      .fromStream(stream)
      .transform(transform)
      .on('data', handleData)
      .on('end', handleEnd)
      .on('error', err => reject(err));
  });
}

module.exports = cook;
