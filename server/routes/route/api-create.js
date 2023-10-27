
const { currentTimeFormatted, getRoutes } = require('../../globals')

module.exports = async function create(req, res, next) {
  try {
    await getRoutes()
      .push({
        ...req.body,
        created: currentTimeFormatted(),
      })
      .write()
    res.send({
      success: true,
      message: 'route created'
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
