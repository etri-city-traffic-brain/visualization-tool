const bboxpolygon = require('../../utils/bboxpolygon')

const ZOOM_MIN = 13

const zoomSpeed = {
  13: 30,
  14: 40,
  15: 30,
  16: 20
}

module.exports = async (collection, { extent, zoom }) => {
  console.log('zoom: ', zoom)
  if (zoom < ZOOM_MIN) {
    return []
  }
  const speed = zoomSpeed[zoom] || 0
  const r = await collection.find({
    geometry: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [bboxpolygon(extent)]
        }
      }
    },
    'properties.SPEEDLH': { $gt: speed }
  }).toArray()
  return r
}
