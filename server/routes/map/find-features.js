const bboxpolygon = require('../../utils/bboxpolygon')

const ZOOM_MIN = 14

const zoomSpeed = {
  15: 50,
  16: 20
}

module.exports = async (collection, { extent, zoom }) => {
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
};
