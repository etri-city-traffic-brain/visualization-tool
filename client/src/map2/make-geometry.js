/**
 * make maptalks's geometry object and return it
 */
import * as maptalks from 'maptalks';
import makeId from './make-id';

const coordinates = ({ geometry }) =>
  geometry.type === 'MultiLineString'
    ? geometry.coordinates[0]
    : geometry.coordinates

export default (feature) => new maptalks.LineString(coordinates(feature), {
  arrowPlacement: 'vertex-last',
  symbol: {
    lineColor: 'gray',
    lineWidth: 1,
  },
  properties: feature.properties,
  id: makeId(feature),
});
