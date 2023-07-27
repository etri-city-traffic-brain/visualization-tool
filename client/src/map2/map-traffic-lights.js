// @ts-nocheck
/*!
 * Traffic Light Viewer
 */

import * as maptalks from 'maptalks'

import extent from './map-extent'
import mapService from '../service/map-service'

import OptStatusLayer from './opt-status-layer'
import signalService from '@/service/signal-service'
import tlUtils from '@/config/utils'

const addLayerTo = map => name =>
  new maptalks.VectorLayer(name, [], {}).addTo(map)

const { log } = console

export default function SaltTrafficLightsLoader(map, groupIds, events) {
  map.setMinZoom(14)
  const addLayer = addLayerTo(map)
  const trafficLightsLayer = addLayer('trafficLightsLayer')
  const layer = new OptStatusLayer('hello')

  function makeTrafficLight(feature, color) {
    const nodeId = feature.properties.NODE_ID
    const nodeName = signalService.nodeIdToName(nodeId)
    const groupId = tlUtils.findGroupId(nodeId)

    const trafficLight = new maptalks.Marker(feature.geometry.coordinates, {
      symbol: [
        {
          markerType: 'ellipse',
          markerFill: color,
          markerFillOpacity: 0.6,
          markerWidth: 15,
          markerHeight: 15,
          markerLineWidth: 2,
          textHaloFill: 'blue',
          textHaloRadius: 1,
          textName: `${nodeName} ${groupId}`,
          textDy: -20,
        }
      ]
    })
      .on('click', async e => {
        const target = e.target
        if (!target) {
          return
        }
        events.$emit('junction:clicked', {
          nodeId: target.properties.NODE_ID,
          coordinates: target.toGeoJSONGeometry().coordinates
        })
      })
      .on('mouseenter', e => {
        e.target.updateSymbol([
          {
            markerFillOpacity: 1,
            textHaloFill: 'red',
          }
        ])
        e.target.bringToFront()
      })
      .on('mouseout', e => {
        e.target.updateSymbol([
          {
            markerFillOpacity: 0.7,
            textHaloFill: 'blue',
          }
        ])
      })

    trafficLight.properties = feature.properties
    return trafficLight
  }

  async function load() {
    if (!trafficLightsLayer.isVisible()) {
      return
    }
    const { features } = await mapService.getTrafficLights(extent(map))
    trafficLightsLayer.clear()

    const geometries = features.map(feature => {
      const groupId = tlUtils.findGroupId(feature.properties.NODE_ID)

      let color = 'gray'
      if (groupIds.length && groupIds.includes(groupId)) {
        color = 'red'

      }
      groupIds.forEach(id => {
        if (groupId && id.indexOf(groupId) >= 0) {
          if (groupId !== 'SA 1') {
            color = 'red'

          }
        }
      })

      const trafficLight = makeTrafficLight(feature, color)
      if (color === 'gray') {
        trafficLight.hide()
      }
      return trafficLight
    })
    trafficLightsLayer.addGeometry(geometries)


  }



  function setOptJunction(junctionIds) {
    const tlayer = map.getLayer('trafficLightsLayer')
    const data = []
    tlayer.getGeometries().forEach(g => {
      junctionIds.forEach(junctionId => {
        if (g.properties.NODE_ID === junctionId) {
          data.push({
            coord: g
              .getCoordinates()
              .add(0.0, 0.0003)
              .toArray(),
            text: '최적화 중 '
            // text: ''
          })
          // layer.setData([
          //   {
          //     coord: g.getCoordinates().add(0.00, 0.0003).toArray(),
          //     text: '최적화 중 '
          //   }
          // ])
        }
      })
      layer.setData(data)
    })
    layer.addTo(map)
  }
  function clearOptJunction() {
    layer.setData([])
  }

  map.on('zoomend moveend', load)

  return {
    load,
    setOptJunction,
    clearOptJunction,
  }
}
