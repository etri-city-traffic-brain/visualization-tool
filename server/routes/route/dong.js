
const fs = require('fs-extra')

const { config } = require('../../globals')

module.exports = async (req, res, next) => {

  try {
    const geojson = await fs.readFile(`${config.base}/data/hangjeongdong/daejeon.geojson`)
    res.json(JSON.parse(geojson))

  } catch (err) {
    next(err)
  }
}
