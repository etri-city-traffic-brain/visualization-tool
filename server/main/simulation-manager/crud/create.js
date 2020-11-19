
module.exports = async function createSimulation(lowDbTable, param, created) {
  await lowDbTable().push({
      ...param,
      status: 'preparing',
      created,
      epoch:0,
    })
    .write();
};
