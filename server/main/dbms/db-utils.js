const simulationStatusUpdater = db => (id, status, param = {}) => {
  db().find({ id })
    .assign({
      status,
      ...param,
    })
    .write();
}

module.exports = {
  simulationStatusUpdater: simulationStatusUpdater,
}