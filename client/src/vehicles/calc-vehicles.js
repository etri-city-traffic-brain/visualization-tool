const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const VEHICLE_LENGTH_SMALL = 24;
const VEHICLE_LENGTH_LARGE = 48;
const CAR_HEIGHT = 8

function makeVehicles(p1, p2, vehicles = [], VehicleFactory) {
  const result = []

  const angle = angleBetween(p2, p1) + Math.PI

  let sx = 0;
  let sy = 0
  for(let i = 0; i < vehicles.length; i += 1 ) {
    const carType = vehicles[i]
    const carLen = carType ? VEHICLE_LENGTH_LARGE : VEHICLE_LENGTH_SMALL
    const color = carType ? '#1E90FF' : '#FF8C00'
    const length = carType ? 40 : 20
    if (i === 0) {
      sx = p1.x;
      sy = p1.y;
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
        width: CAR_HEIGHT
      })
    )
  }

  return result
}

export default makeVehicles
