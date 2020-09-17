const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const CAR_SMALL = 24;
const CAR_LARGE = 48;
const MARGIN = 4;


function calcVehiclesLoc(p1, p2, numCars = []) {
  const result = []

  const angle = angleBetween(p2, p1) + Math.PI

  let sx = 0;
  let sy = 0
  for(let i = 0; i < numCars.length; i += 1 ) {
    const carType = numCars[i]
    const carLen = carType ? CAR_SMALL : CAR_LARGE
    const color = carType ? '#1E90FF' : '#FF8C00'
    if (i === 0) {
      sx = p1.x;
      sy = p1.y;
    }

    const start  = {
      x: sx + MARGIN * Math.cos(angle),
      y: sy + MARGIN * Math.sin(angle)
    }
    const end  = {
      x: sx + carLen * Math.cos(angle),
      y: sy + carLen * Math.sin(angle)
    }

    sx = end.x
    sy = end.y

    result.push({
      start,
      end,
      color,
      angle
    })
  }

  return result
}

export default calcVehiclesLoc
