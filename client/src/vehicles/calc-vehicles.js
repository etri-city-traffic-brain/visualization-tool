const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x)

const { log } = console
/**
 *
 * @param {Object} startLocation
 * @param {number} startLocation.x - x
 * @param {number} startLocation.y - y
 * @param {Array} vehicles
 * @param {Array} vehicleTypes
 * @param {*} VehicleFactory
  */
function makeVehicles ({ startLocation, vehicles = [], VehicleFactory }) {
  const [vehicleTypes, edgeChunks] = vehicles
  const result = []

  let vehicleLocationIndex = 0
  for (let i = 0; i < vehicleTypes.length; i += 1) {
    const carType = vehicleTypes[i]

    const idx = edgeChunks.length - 1 === i ? edgeChunks.length : edgeChunks.length - 1

    const chunk = edgeChunks[vehicleLocationIndex] ? edgeChunks[vehicleLocationIndex] : edgeChunks[idx]

    let angle = angleBetween(edgeChunks[i] || startLocation, edgeChunks[i + 1] || startLocation)
    if (angle === 0) {
      angle = result[i - 1].angle
    }
    const v = VehicleFactory.of(carType, {
      start: {
        x: chunk.x,
        y: chunk.y
      },
      angle
    })

    // log('angle: ', angleBetween(edgeChunks[i] || startLocation, edgeChunks[i+0] || startLocation), i, vehicleTypes.length)

    vehicleLocationIndex++
    if (carType === 1) {
      vehicleLocationIndex += 1
    }
    result.push(v)
  }
  return result
}

export default makeVehicles
