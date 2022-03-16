
module.exports = getTable => (id, status, param = {}) => {
  getTable().find({ id })
    .assign({
      status,
      ...param
    })
    .write()
}
