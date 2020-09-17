/**
 * @param {number} radians
 */
const degree = radians => radians * (180 / Math.PI);

/**
 * @param {number} degrees
 */
const radians = (degrees) => degrees * (Math.PI/180);

/**
 * @param {{ x: number; y: number; }} p1
 * @param {{ x: number; y: number; }} p2
 */
const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const distance = function( x1, y1, x2, y2 ) {

  var 	xs = x2 - x1,
    ys = y2 - y1;

  xs *= xs;
  ys *= ys;

  return Math.sqrt( xs + ys );
}

// module.exports = {
//   degree,
//   radians,
//   angleBetween,
//   distance,
// };
export default {
  degree,
  radians,
  angleBetween,
  distance,
};
