
const { getRoute } = require('../../globals')

function get(req, res) {
  const { params: { id } } = req

  const obj = getRoute(id)
  if (!obj) {
    res.statusMessage = 'Not Found'
    res.status(404).end()
    return
  }

  res.json(obj)
}

module.exports = get
