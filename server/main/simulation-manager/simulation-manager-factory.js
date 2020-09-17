// const {
//   console: console,
// } = require('../module/library');
const {
  mkdir,
  upload,
} = require('./uploader');
const run = require('./simulation-runner');

const REQUIRED_FILES = [
  '1.py',
  '2.py',
  'hello_world.py',
];

const uploadFiles = async (from, to, simulationId, vmInfo) => {
  const uploadStatus = await Promise.all(REQUIRED_FILES.map(async (file) => {
    const simulationFrom = `${from}/${simulationId}/${file}`;
    const simulationTo = `${to}/${simulationId}/${file}`;
    return upload(simulationFrom, simulationTo, vmInfo);
  }));

  const allUploaded = !uploadStatus.some((status) => status === false);
  return allUploaded;
};

const uploadModule = (from, to, vmInfo) => async (simulationId) => {
  try {
    await mkdir(to, simulationId, vmInfo);
    const status = await uploadFiles(from, to, simulationId, vmInfo);
    console.log(`${simulationId} - ${status}`);
    return status;
  } catch (err) {
    console.log(`${simulationId} - ${err.message}`);
    return false;
  }
};

const runModule = (to, vmInfo) => async (simulationId) => {
  try {
    return await run(to, vmInfo, simulationId);
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

module.exports = (from, to, vmInfo) => ({
  upload: uploadModule(from, to, vmInfo),
  run: runModule(to, vmInfo),
});
