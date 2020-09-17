const fs = require('fs');
const { Client } = require('ssh2');

module.exports = {
  mkdir: (pathLocal, simulationId) => new Promise((resolve, reject) => {
    const simulationDir = `${pathLocal}/${simulationId}`;
    try {
      if (!fs.existsSync(simulationDir)) {
        fs.mkdirSync(simulationDir);
      }
      resolve(`Success to mkdir ${simulationDir}`);
    } catch (err) {
      reject(err);
    }
  }),
  files: (dirRemote, vmInfo) => new Promise((resolve, reject) => {
    const connect = new Client();
    connect.on('error', (err) => {
      reject(err);
      connect.end();
    }).on('ready', () => {
      connect.sftp((err, sftp) => {
        if (err) {
          return reject(err);
        }
        return sftp.readdir(dirRemote, (err, files) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(files.map(({ filename }) => filename));
        });
      });
    }).connect(vmInfo);
  }),
  download: (localFile, remoteFile, vmInfo) => new Promise((resolve, reject) => {
    const connect = new Client();
    connect.on('error', (err) => {
      reject(err);
      connect.end();
    }).on('ready', () => {
      connect.sftp((err, sftp) => {
        if (err) {
          reject(err);
          connect.end();
        }
        const readStream = sftp.createReadStream(remoteFile)
          .on('error', (err) => {
            reject(err);
            connect.end();
          });
        const writeStream = fs.createWriteStream(localFile)
          .on('error', (err) => {
            reject(err);
            connect.end();
          })
          .on('close', () => {
            resolve(true);
            connect.end();
          });
        readStream.pipe(writeStream);
      });
    }).connect(vmInfo);
  }),
};
