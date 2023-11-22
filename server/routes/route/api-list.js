const paginate = require('paginate-array')
const { getRoutes } = require('../../globals')

module.exports = async function list(req, res) {
  const {
    page = 1,
    perPage = 15,
  } = req.query

  array = getRoutes()
    .sortBy('created', 'asc')
    .value()
    .reverse()

  res.json(paginate(array, page, perPage))
}
