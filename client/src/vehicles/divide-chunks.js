
import chunk from '@turf/line-chunk'


/**
 * @param obj
 * @param {Number} obj.chunkLength - 셀의 차량위치를 위한 청크 길이
 * @param {function} obj.coordinateToContainerPoint - 셀의 차량위치를 위한 청크 길이
 * @param {Array} obj.coordinates - 링크 혹은 셀의 좌표 목록
 */
export default ({ chunkLength = 0.007, coordinateToContainerPoint, coordinates }) => {
  const line = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates.map(coordinate => [coordinate.x, coordinate.y])
    }
  };

  return chunk(line, chunkLength, { units: 'kilometers' }).features
    .map(feature => feature.geometry.coordinates)
    .map(coordinates => coordinateToContainerPoint({
      x: coordinates[0][0],
      y: coordinates[0][1],
    })).reverse()
}
