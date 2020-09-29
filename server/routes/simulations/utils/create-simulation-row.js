
module.exports = async function createSimulation(param, lowDbTable, created) {
  await lowDbTable
    .push({
      id: param.id,
      user: param.user,
      description: param.description,
      configuration: param.configuration,
      status: 'preparing',
      created,
    })
    .write();
};
