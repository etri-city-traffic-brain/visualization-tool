const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const VEHICLE_LENGTH_SMALL = 24;
const VEHICLE_LENGTH_LARGE = 48;
const CAR_HEIGHT = 8

function makeVehicles(p1, p2, vehicles = [], VehicleFactory) {
  const result = []
  let angle = angleBetween(p2, p1) + Math.PI
  const alpha = 0.6;

  let sx = 0;
  let sy = 0
  for(let i = 0; i < vehicles.length; i += 1 ) {
    const carType = vehicles[i]
    const carLen = carType ? VEHICLE_LENGTH_LARGE * alpha : VEHICLE_LENGTH_SMALL * alpha
    const color = carType ? '#1E90FF' : '#FF8C00'
    const length = (carType ? 40 : 20) * 1
    if (i === 0) {
      sx = p2.x;
      sy = p2.y;
    }

    const start  = {
      x: sx,
      y: sy
    }

    sx = sx + carLen * Math.cos(angle)
    sy = sy + carLen * Math.sin(angle)

    result.push(
      VehicleFactory.of(carType, {
        start,
        color,
        angle,
        length,
        width: CAR_HEIGHT * alpha
      })
    )
  }

  return result
}

export default makeVehicles
