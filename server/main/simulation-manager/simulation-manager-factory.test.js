//    TEST SIMULATION RUNNER
//    2019

/* eslint-disable no-console */
const cloudService = require('../service/cloud-service');
const run = require('./simulation-runner');

(async () => {
  try {
    const vmInfo = await cloudService.getVmInfo();
    const result = await run('simulation1', vmInfo, '');
    console.log(result);
  } catch (err) {
    console.log(err.message);
  }
})();
