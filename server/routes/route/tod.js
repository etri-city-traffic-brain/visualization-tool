
const fs = require('fs-extra')

const { config } = require('../../globals')

module.exports = async (req, res, next) => {

  const { params: { id } } = req

  try {
    const from = await fs.readFile(`${config.base}/route/${id}/tod.json`)
    res.json(JSON.parse(from))

  } catch (err) {
    next(err)
  }
}
