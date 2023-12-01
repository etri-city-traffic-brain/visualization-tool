
const { getRoutes } = require('../../globals')

module.exports = async function update(req, res) {
  const {
    id,
    status
  } = req.body
  console.log('update status:', id, status)
  await getRoutes().find({ id })
    .assign({
      status
    }).write()

  res.send({
    success: true
  })
}

// getTable().find({ id })
//   .assign({
//     status,
//     ...param
//   })
//   .write()
