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

const status = require('./simulatoin-status');

const { currentTimeFormatted, updateStatus } = require('../../globals');

const makeChartData = require('../chart-data-maker');
const recordResult = require('./record-to-mongo')

const config = require('../../config');
const { output } = config.saltPath;

const subIds = (cellId) => {
  const subIds = cellId.split('_');
  return {
    linkId: subIds[0],
    sectionId: `${subIds[0]}_${subIds[1]}`,
    cellId,
  };
};

const pickResultFile = id => {
  const file = fs.readdirSync(`${output}/${id}`).find(file => file.endsWith('.csv'));
  if(!file) return null
  return `${output}/${id}/${file}`
}

module.exports = ({ simulationId, duration, period }) => {
  debug('Start cooking simulation result', simulationId);
  if (!simulationId) {
    return Promise.reject(new Error('simulation id missed'));
  }

  const simulationResultFile = pickResultFile(simulationId)
  debug('target file:', simulationResultFile)
  if (!simulationResultFile) {
    return Promise.reject(new Error('simulation result file(csv) not found...'));
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(simulationResultFile);
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
      if (speed >= 0) {
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
        debug('insert mongo start')
        await recordResult(simulationId, cells);
        debug('insert mongo end')
        await makeChartData(output, simulationId, {
          meta: {
            duration,
            period,
          },
          data: cells,
        });

        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
        debug(`The worker uses approximately ${Math.round(memoryUsed * 100) / 100} MB`);
        debug(`${(Date.now() - start) / 1000} sec`);

        updateStatus(simulationId, status.FINISHED, { ended: currentTimeFormatted() });
        resolve(true);
      } catch (err) {
        updateStatus(simulationId, status.ERROR, { error: err.message, ended: currentTimeFormatted() });
        debug(err.message);
        reject(err);
      }
    };

    const handleError = err => reject(err)

    csv
      .fromStream(stream)
      .transform(transform)
      .on('data', handleData)
      .on('end', handleEnd)
      .on('error', handleError);
  });
};
