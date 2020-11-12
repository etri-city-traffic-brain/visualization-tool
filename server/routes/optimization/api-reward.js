
const read = require('../../main/signal-optimization/read-reward')

module.exports = async (req, res, next) => {
  const { id, } = req.query;
  try {
    res.send(await read(id))
  } catch (err) {
    next(err)
  }
}
