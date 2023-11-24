
const fs = require('fs-extra')

const { config } = require('../../globals')

module.exports = async (req, res, next) => {

  const region = req.query.region
  console.log('requested region:', region)
  try {
    if (!region) {
      const geojson = await fs.readFile(`${config.base}/data/hangjeongdong/daejeon.geojson`)
      res.json(JSON.parse(geojson))
    } else {
      const geojson = await fs.readFile(`${config.base}/data/hangjeongdong/sejong.geojson`)
      res.json(JSON.parse(geojson))
    }

  } catch (err) {
    next(err)
  }
}
