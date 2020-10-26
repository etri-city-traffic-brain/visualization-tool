const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

/**
 *
 * @param {Object} startLocation
 * @param {number} startLocation.x - x
 * @param {number} startLocation.y - y
 * @param {Array} vehicles
 * @param {Array} vehicleTypes
 * @param {*} VehicleFactory
  */
function makeVehicles({startLocation, vehicles = [], VehicleFactory}) {

  const [vehicleTypes, edgeChunks ] = vehicles
  const result = []

  let vehicleLocationIndex = 0;
  for(let i = 0; i < vehicleTypes.length; i += 1) {
    const carType = vehicleTypes[i]

    const chunk = edgeChunks[vehicleLocationIndex] ? edgeChunks[vehicleLocationIndex] : edgeChunks[edgeChunks.length - 1]

    const v = VehicleFactory.of(carType, {
      start: {
        x: chunk.x,
        y: chunk.y
      },
      angle: angleBetween(edgeChunks[i] || startLocation, edgeChunks[i+1] || startLocation),
    })

    vehicleLocationIndex++
    if(carType === 1) {
      vehicleLocationIndex += 1
    }
    result.push(v)
  }
  return result
}

export default makeVehicles
