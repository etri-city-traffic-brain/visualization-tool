//    TEST UPLOADER
//    2019

/* eslint-disable no-console */
const cloudService = require('../service/cloud-service');
// const upload = require('./upload-manager');
const { mkdir, upload } = require('./uploader');

(async () => {
  try {
    const vmInfo = await cloudService.getVmInfo();
    await mkdir('/home/ubuntu/salt/data/', 'test2', vmInfo);
    // const result = await upload(
    //   '/home/ubuntu/salt/data/test1/sub0.tss.xml',
    //   '/home/ubuntu/salt/data/test1/sub0.tss.xml',
    //   vmInfo,
    // );
    // console.log(result);
  } catch (err) {
    console.log(err.message);
  }
})();
