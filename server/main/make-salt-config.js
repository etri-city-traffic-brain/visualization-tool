
function make(vmInfo) {
  // const worker = vmInfo.workers.map(worker => ({ ip: worker }));
  return {
    masterIP: vmInfo.masterIP,
    worker: [],
    workerUser: 'ubuntu',
    masterWorkingDir: '/home/ubuntu/salt/',
    workerWorkingDir: '/home/ubuntu/salt/',
    keyFile: '/home/ubuntu/salt/saltcloudvmkey.pem',
    // uiServer: 'http://180.210.14.100:3000',
    uiServer: 'http://127.0.0.1:3000',
  };
}

module.exports = make;
