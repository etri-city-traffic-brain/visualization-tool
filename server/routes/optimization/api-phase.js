const read = require('../../main/signal-optimization/read-phase')

module.exports = async (req, res, next) => {
  const { id, type } = req.query;
  try {
    res.send(await read(id, type))
  } catch (err) {
    next(err)
  }
}
