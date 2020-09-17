/* eslint-disable no-console */
const service = require('./cloud-service');

(async () => {
  const userId = 'salt_normal_test';
  try {
    // const keyInfo = await service.getSshKey(userId);
    // console.log(keyInfo);
    // const vmInfo = await service.getVmInfo(userId, 2);
    // console.log(vmInfo);
    // console.log('*** SSH KEY INFO ***');
    // console.log('*** VM INFO ***');
    const packageInfo = await service.checkPackage(userId, 2);
    const r = await service.makeVmInfo(packageInfo);
    console.log(r);
  } catch (err) {
    console.log(err.message);
  }
})();
