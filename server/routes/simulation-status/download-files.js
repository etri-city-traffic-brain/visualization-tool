const downloader = require('../../main/simulation-manager/downloader');

/**
 * download files from remote server
 * @param {Object} param
 */
async function downloadFiles({
  pathLocal, pathRemote, simulationId, vmInfo,
}) {
  const dirLocal = `${pathLocal}/${simulationId}`;
  const dirRemote = `${pathRemote}/${simulationId}`;
  const fileNames = await downloader.files(dirRemote, vmInfo);

  const promises = await Promise.all(fileNames.map(async (fileName) => {
    const localFile = `${dirLocal}/${fileName}`;
    const remoteFile = `${dirRemote}/${fileName}`;
    return downloader.download(localFile, remoteFile, vmInfo);
  }));
  return promises.every(status => status);
}

module.exports = downloadFiles;
