import * as maptalks from 'maptalks'

import extent from './map-extent'
import mapService from '../service/map-service'

const addLayerTo = map => name => new maptalks.VectorLayer(name, [], {}).addTo(map)

function makeTrafficLight (feature, color, events) {
  const trafficLight = new maptalks.Marker(feature.geometry.coordinates, {
    symbol: [
      {
        markerType: 'ellipse',
        markerFill: color,
        markerFillOpacity: 0.6,
        markerWidth: 15,
        markerHeight: 15,
        markerLineWidth: 2
      }
    ]
  })
    .on('click', async (e) => {
      const target = e.target
      if (!target) {
        return
      }
      events.$emit('junction:clicked', {
        nodeId: target.properties.NODE_ID,
        coordinates: target.toGeoJSONGeometry().coordinates
      })
    })
    .on('mouseenter', (e) => {
      e.target.updateSymbol({
        textName: feature.properties.CROSS_NM,
        textSize: 20,
        markerFillOpacity: 1,
        textFaceName: 'sans-serif',
        textHaloFill: '#fff',
        textHaloRadius: 15
      })
      e.target.bringToFront()
    }).on('mouseout', (e) => {
      e.target.updateSymbol({
        markerFillOpacity: 0.7,
        textName: ''
      })
    })

  trafficLight.properties = feature.properties
  return trafficLight
}
async function loadTrafficLights (map, layer) {
  if (!layer.isVisible()) {
    return
  }
  const { features } = await mapService.getTrafficLights(extent(map))
  layer.clear()
  const geometries = features.map((feature) => {
    const trafficLight = makeTrafficLight(feature, 'red')
    return trafficLight
  })
  trafficLightsLayer.addGeometry(geometries)
}

function OptJunctionManager (map, junctions) {
  const addLayer = addLayerTo(map)
  const junctionLayer = addLayer('junctionLayer')
}

export default OptJunctionManager
