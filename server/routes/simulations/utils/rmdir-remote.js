/**
 * remove remote directory on the remote server
 */

const Client = require('ssh2-sftp-client');

async function rmDirRemote(vmInfo, targetDir) {
  const client = new Client();
  try {
    await client.connect(vmInfo);
    const exists = await client.exists(targetDir);
    if (exists) {
      await client.rmdir(targetDir, true);
    }
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
}

module.exports = rmDirRemote;
