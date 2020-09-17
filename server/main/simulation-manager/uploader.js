const fs = require('fs');
const { Client } = require('ssh2');

const mkdir = (connect, simulationDir) => new Promise((resolve, reject) => {
  connect.exec(`mkdir ${simulationDir}`, (err, stream) => {
    if (err) {
      reject(err);
      connect.end();
    }
    stream.on('close', () => {
      resolve(`Success to mkdir ${simulationDir}`);
      connect.end();
    }).on('data', () => {});
  });
});

module.exports = {
  mkdir: (to, simulationId, vmInfo) => new Promise((resolve, reject) => {
    const simulationDir = `${to}/${simulationId}`;
    const connect = new Client();
    connect.on('error', (err) => {
      reject(err);
      connect.end();
    }).on('ready', () => {
      mkdir(connect, simulationDir).then((result) => {
        resolve(result);
      }).catch(err => reject(err));
    }).connect(vmInfo);
  }),
  upload: (from, to, vmInfo) => new Promise((resolve, reject) => {
    const connect = new Client();
    connect.on('error', (err) => {
      reject(err);
      connect.end();
    }).on('ready', () => {
      connect.sftp((err, sftp) => {
        if (err) return reject(err);
        const readStream = fs.createReadStream(from).on('error', (err) => {
          reject(err);
          connect.end();
        });
        const writeStream = sftp.createWriteStream(to).on('error', (err) => {
          reject(err);
          connect.end();
        });
        writeStream.on('close', () => {
          resolve(true);
          connect.end();
        });
        readStream.pipe(writeStream);
      });
    }).connect(vmInfo);
  }),
};
