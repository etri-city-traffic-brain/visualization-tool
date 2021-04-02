import makeVehicles from '../vehicles/calc-vehicles'
import VehicleFactory from '../vehicles/model/factory'
import * as d3 from 'd3'
import divideChunks from '../vehicles/divide-chunks'

const chunkLength = 0.007

const linkId = cell => cell.properties.LINK_ID

const sc = d3.scaleLinear().domain([18, 20]).range([0.6, 2.5])
/**
 *
 * @param {Object} obj - An object
 * @param {Object} obj.context - HTML5 canvas graphics context
 * @param {Object} obj.map - Maptalks map object
 * @param {Function} obj.getEdges - get edges
 */
function drawVehicles ({
  context,
  map,
  getEdges,
  realtimeEdgeData
}) {
  const hasRealtimeData = cell => !!realtimeEdgeData[linkId(cell)]

  getEdges()
    .filter(hasRealtimeData)
    .map(edge => {
      const startLocation = map.coordinateToContainerPoint(edge.getFirstCoordinate())
      const edgeRealtime = realtimeEdgeData[edge.properties.LINK_ID]

      const edgeChunks = divideChunks({
        chunkLength: chunkLength,
        coordinateToContainerPoint: map.coordinateToContainerPoint.bind(map),
        coordinates: edge.getCoordinates()
      })

      const vehicleTypes = edgeRealtime.vehicles.slice(0, edgeRealtime.numVehicles)
      return makeVehicles({
        startLocation,
        vehicles: [vehicleTypes, edgeChunks],
        VehicleFactory
      }
      )
    })
    .forEach(vehicles => {
      vehicles.forEach(vehicle => {
        vehicle.draw(context, map.getZoom(), sc(map.getZoom()))
      })
    })
}

export default drawVehicles
