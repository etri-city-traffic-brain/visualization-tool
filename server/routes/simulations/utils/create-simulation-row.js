
module.exports = async function createSimulation(param, lowDbTable, created) {
  await lowDbTable
    .push({
      // id: param.id,
      // user: param.user,
      // type: param.type,
      // description: param.description,
      // configuration: param.configuration,
      ...param,
      status: 'preparing',
      created,
      epoch:0,
    })
    .write();
};
