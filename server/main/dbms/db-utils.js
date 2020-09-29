const simulationStatusUpdater = lowDbTable => (id, status, param = {}) => {
  lowDbTable().find({ id })
    .assign({
      status,
      ...param,
    })
    .write();
}

module.exports = {
  simulationStatusUpdater,
}
