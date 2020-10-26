import makeVehicles from '../vehicles/calc-vehicles';
import VehicleFactory from '../vehicles/model/factory'

import divideChunks from '../vehicles/divide-chunks'

const chunkLength = 0.007

function drawVehicles({context, map, getEdges, getEdgesRealtime}) {
  const edgesRealtime = getEdgesRealtime().reduce((acc, cur) => {
    acc[cur.roadId.substring(0, 14)] = cur
    return acc
  }, {})

  const hasRealtimeData = cell => !!edgesRealtime[cell.properties.LINK_ID]

  getEdges()
    .filter(hasRealtimeData)
    .map((edge => {
      const startLocation = map.coordinateToContainerPoint(edge.getFirstCoordinate());
      const edgeRealtime = edgesRealtime[edge.properties.LINK_ID]

      const edgeChunks = divideChunks({
        chunkLength: chunkLength,
        coordinateToContainerPoint: map.coordinateToContainerPoint.bind(map),
        coordinates: edge.getCoordinates()
      })

      const vehicleTypes = edgeRealtime.vehicles.slice(0, edgeRealtime.numVehicles)
      return makeVehicles({
        startLocation,
        vehicles: [vehicleTypes, edgeChunks],
        VehicleFactory,
      }
      )
    }))
    .forEach(vehicles => {
      vehicles.forEach(vehicle => {
        vehicle.draw(context, map.getZoom())
      })
    })
}

export default drawVehicles
