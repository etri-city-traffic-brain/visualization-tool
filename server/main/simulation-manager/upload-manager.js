const { mkdir, upload } = require('./uploader');

const uploadFiles = async (from, to, simulationId, vmInfo, files) => {
  const uploadStatus = await Promise.all(
    files.map(async (file) => {
      const simulationFrom = `${from}/${simulationId}/${file}`;
      const simulationTo = `${to}/${simulationId}/${file}`;
      return upload(simulationFrom, simulationTo, vmInfo);
    }),
  );

  const allUploaded = !uploadStatus.some(status => status === false);
  return allUploaded;
};

// module.exports = SimulationManager;
module.exports = async ({
  localPath,
  remotePath,
  vmInfo,
  files,
  simulationId,
}) => {
  try {
    await mkdir(remotePath, simulationId, vmInfo);
    const status = await uploadFiles(
      localPath,
      remotePath,
      simulationId,
      vmInfo,
      files,
    );
    console.log(`${simulationId} - ${status}`);
    return status;
  } catch (err) {
    console.log(`${simulationId} - ${err.message}`);
    return false;
  }
};
