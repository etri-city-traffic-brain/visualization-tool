const read = require('../../main/signal-optimization/read-phase')

module.exports = async (req, res, next) => {
  const { id, type } = req.query;
  console.log('read phase:', id, type)
  try {
    res.send(await read(id, type))
  } catch (err) {
    console.log(err.message)
    next(err)
  }
}
