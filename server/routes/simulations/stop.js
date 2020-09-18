/* eslint-disable no-await-in-loop */
const debug = require('debug')('api:stop');
const { Client } = require('ssh2');
const {
  updatetStatus,
} = require('./globals');

const db = require('../../main/dbms/db');

const { getSimulations } = db;

const {
  services: {
    cloudService,
  },
} = global.SALT;

const getSimulation = id => getSimulations().find({ id }).value();

async function kill(vmInfo, port) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    const cmd = `fuser -kn tcp ${port}`;
    client.on('ready', () => {
      client.exec(cmd, (err, stream) => {
        if (err) {
          return;
        }
        const logs = [];
        stream
          .on('end', () => resolve(logs))
          .on('data', (data) => {
            debug(data);
            logs.push(data.toString());
          })
          .on('error', (err) => {
            debug(err.toString());
            reject(new Error(err.toString()));
          })
          .stderr
          .on('data', (err) => {
            debug(err.toString());
          });
      });
    }).connect(vmInfo);
  });
}

/* eslint no-unused-expressions:0 */
async function stop(req, res) {
  const { params: { id } } = req;

  // const simulation = getSimulation(id);
  // const masterVmInfo = await cloudService.getVmInfo(simulation.user);
  // debug('stop', masterVmInfo.host, simulation.masterPort);
  // await kill(masterVmInfo, simulation.masterPort);
  // for (let i = 0; i < masterVmInfo.workers.length; i += 1) {
  //   const worker = masterVmInfo.workers[i];
  //   debug('stop', worker, simulation.workerPort);
  //   await kill({
  //     host: worker,
  //     port: 22,
  //     privateKey: masterVmInfo.privateKey,
  //     username: 'ubuntu',
  //   }, simulation.workerPort);
  // }
  updatetStatus(id, 'stopped');
  res.json({
    id,
  });
}

module.exports = stop;
