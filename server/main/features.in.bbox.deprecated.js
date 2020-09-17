//        Deprecated
//        We found another solution

const {
  bboxPolygon,
  booleanPointInPolygon,
  lineString,
  multiLineString,
  featureCollection,
} = require('@turf/turf');

function getDimension(array) {
  const dim = [];
  for (;;) {
    dim.push(array.length);
    if (Array.isArray(array[0])) {
      array = array[0];
    } else {
      break;
    }
  }
  return dim;
}

const isMultiLineString = coordinate => getDimension(coordinate).length > 1;

/**
 * check whether features is inside bounding box or not
 */
const featuresInBbox = (bbox, features) => features.filter(({ geometry: { coordinates } }) => coordinates.some((coordinate) => {
  if (isMultiLineString(coordinate)) {
    return booleanPointInPolygon(coordinate[0], bbox);
  }
  return booleanPointInPolygon(coordinate, bbox);
}));

module.exports = featuresInBbox;

if (require.main === module) {
  const bbox = bboxPolygon([-20, -20, 50, 50]);

  const link1 = lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], { LINK_ID: 'line 1' });
  const link2 = lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], { LINK_ID: 'line 2' });
  const link3 = multiLineString([[[-14, 43], [-13, 40], [-15, 45], [-10, 49]]], { LINK_ID: 'line 2' });

  const collection = featureCollection([
    link1,
    link2,
    link3,
  ]);

  const result = featuresInBbox(bbox, collection.features);
  result.forEach(r => console.log(r.geometry));
}
