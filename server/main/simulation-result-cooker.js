/* eslint-disable no-await-in-loop */

/**
 * add simulation result to MongoDB collection
 * and generate statistical chart data
 *
 * author: Yeonheon Gu
 * modified: 2020-09-17
 */
const debug = require('debug')('api:simulation-result');

const fs = require('fs');
const csv = require('fast-csv');
const moment = require('moment');
const mongoose = require('mongoose');

const config = require('../config');
const status = require('./status');

const currentTime = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
const makeChartData = require('../main/chart-data-maker');

const { output } = config.saltPath;

const subIds = (cellId) => {
  const subIds = cellId.split('_');
  return {
    linkId: subIds[0],
    sectionId: `${subIds[0]}_${subIds[1]}`,
    cellId,
  };
};

async function insertToMongo(collectionName, cells) {
  const db = mongoose.connection.useDb('simulation_results');
  await db.collection(collectionName).drop();

  const collection = db.collection(collectionName);
  await collection.createIndex({ cellId: 1 });
  debug('start bulk insert');
  let bulkOperation = collection.initializeOrderedBulkOp();
  const cellIds = Object.keys(cells);
  for (let i = 0; i < cellIds.length; i += 1) {
    bulkOperation.insert(cells[cellIds[i]]);
    if (i % 1000 === 0) {
      await bulkOperation.execute();
      bulkOperation = collection.initializeOrderedBulkOp();
    }
  }
  await bulkOperation.execute();
  debug('finish bulk insert');
}

module.exports = ({ id, duration, period }, updateStatus) => {
  debug('Start cooking simulation result', id);
  if (!id) {
    return Promise.reject(new Error('simulation id missed'));
  }

  const simulationResultFile = fs.readdirSync(`${output}/${id}`).find(file => file.endsWith('.csv'));
  if (!simulationResultFile) {
    return Promise.reject(new Error('simulation result file(csv) not found...'));
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(`${output}/${id}/${simulationResultFile}`);
    const transform = ([start, , id, , speed]) => ({ start, id, speed });

    const cells = {};
    const start = Date.now();

    const handleData = (row) => {
      if (row.id && row.id === 'simulation') {
        return;
      }
      const { linkId, cellId } = subIds(row.id);

      const cell = cells[cellId] || {};
      const speed = Number((+row.speed).toFixed(1));
      if (speed) {
        cell.linkId = linkId;
        cell.cellId = cellId;
        cell.values = cell.values || [];
        cell.values.push(speed);
        cells[cellId] = cell;
      }
    };

    const handleEnd = async () => {
      stream.close();
      try {
        await insertToMongo(id, cells);
        await makeChartData(output, id, {
          meta: {
            duration,
            period,
          },
          data: cells,
        });

        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
        debug(`The worker uses approximately ${Math.round(memoryUsed * 100) / 100} MB`);
        debug(`${(Date.now() - start) / 1000} sec`);
        updateStatus(status.FINISHED, { ended: currentTime() });
        resolve(true);
      } catch (err) {
        updateStatus(status.ERROR, { error: err.message, ended: currentTime() });
        debug(err.message);
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
};
