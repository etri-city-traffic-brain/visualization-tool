/**
 * Upload using SCP
 * upload file to remote server
 */

const Client = require('ssh2-sftp-client');

function makeUploader({
  host, port = 22, username, privateKey,
}) {
  return async (targetDir, files) => {
    const sftp = new Client();
    try {
      await sftp.connect({
        host,
        port,
        username,
        privateKey,
      });

      const exists = await sftp.exists(targetDir);
      if (!exists) {
        await sftp.mkdir(targetDir, true);
      }
      /* eslint no-restricted-syntax:0 */
      /* eslint no-await-in-loop:0 */
      for (const file of files) {
        const filePath = `${targetDir}/${file}`;
        await sftp.fastPut(filePath, filePath);
      }
    } catch (err) {
      throw err;
    } finally {
      await sftp.end();
    }
  };
}

module.exports = makeUploader;
