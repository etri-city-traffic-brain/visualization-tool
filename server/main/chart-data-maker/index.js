
const csvToJson = require('./csvToJson');
const makeBar = require('./makeBarData');
const makeHistogram = require('./makeHistogramData');
const makePie = require('./makePieData');
const makeGrid = require('./makeGridData');

// const gridDataPath = path.join(__dirname, 'makeGridData');
// const gridDataCommand = (gridDataPath, pathLocal, simulationId) =>
//   `node ${gridDataPath} ${pathLocal} ${simulationId}`;

// const execGrid = (pathLocal, simulationId) =>
//   new Promise((resolve, reject) => {
//     const execCommand = gridDataCommand(gridDataPath, pathLocal, simulationId);
//     const spawnedGrid = exec(execCommand);
//     spawnedGrid.on('error', err => reject(err));
//     spawnedGrid.on('exit', () => resolve());
//     spawnedGrid.stdout.on('data', (data) => {
//       console.log(data);
//     });
//     spawnedGrid.stderr.on('data', err => reject(err));
//   });

const jobList = [
  makeBar,
  makeHistogram,
  makePie,
  makeGrid,
];

const spendTime = (startTime, endTime) => (endTime.getTime() - startTime.getTime()) / 1000;

const sleep = seconds => new Promise(resolve => setTimeout(resolve, seconds));

module.exports = (pathLocal, simulationId, jsonObj) => new Promise((resolve, reject) => {
  const startTime = new Date();
  console.log(startTime);
  console.log('Initialize simulation csv file to json file ...');
  // console.log(pathLocal, simulationId);
  // csvToJson(pathLocal, simulationId)
    // .then(async (result) => {
    //   console.log(result);
    //   console.log('Start simulation analysis ...');
    //   await sleep(2000);
    //   return 
    // })
    Promise.all(jobList.map(job => job(pathLocal, simulationId, jsonObj)))
    .then(() => {
      console.log('Finished analysis');
      const endTime = new Date();
      console.log(endTime);
      console.log(`\n소요시간: ${spendTime(startTime, endTime)}초\n`);
      resolve(true);
    })
    .catch((err) => {
      console.log(err.message);
      reject(err);
    });
});
