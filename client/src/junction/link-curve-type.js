
const curveType = angle => {
  let type = 'dynamic';
  let direction = 0;
  if(-20 < angle && angle < 20) {
    type = 'curvedCCW'; // u turn
    direction = 3;
  }else if( 20 <= angle && angle < 160) {
    type = 'curvedCCW'; // left
    direction = 2;
  }else if( 160 <= angle && angle < 200) {
    direction = 1;
  }else if( 20 <= angle && angle < 340) {
    type = 'curvedCW'; // right
    direction = 0;
  }
  return { type, direction };
}

// module.exports = curveType;


export default curveType;

