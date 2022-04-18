// @ts-nocheck
/*!
 * Traffic Light Viewer
 */

import * as maptalks from 'maptalks'

import extent from './map-extent'
import mapService from '../service/map-service'

import signalGroups from '@/config/junction-config'
import OptStatusLayer from './opt-status-layer'

const addLayerTo = map => name =>
  new maptalks.VectorLayer(name, [], {}).addTo(map)

const { log } = console

function makeGroupPolygon (group) {
  const geometry = new maptalks.Polygon(group.features.geometry.coordinates, {
    visible: true,
    editable: true,
    cursor: 'pointer',
    shadowBlur: 0,
    shadowColor: 'black',
    draggable: false,
    dragShadow: false, // display a shadow during dragging
    drawOnAxis: null, // force dragging stick on a axis, can be: x, y
    symbol: {
      lineColor: '#34495e',
      lineWidth: 2,
      polygonFill: group.properties.color,
      polygonOpacity: 0.2
    }
  })
  geometry.setInfoWindow({
    title: '연동교차로',
    content: group.properties.groupId
  })
  geometry.properties = group.properties
  return geometry
}

const [SA101, SA107, SA111, SA104] = signalGroups.map(value => {
  return {
    junctions: value.properties.junctions,
    color: value.properties.color
  }
})

const groupColor = nodeId => {
  let color = 'grey'
  if (SA101.junctions.includes(nodeId)) {
    color = SA101.color
  }
  if (SA107.junctions.includes(nodeId)) {
    color = SA107.color
  }
  if (SA111.junctions.includes(nodeId)) {
    color = SA111.color
  }
  if (SA104.junctions.includes(nodeId)) {
    color = SA104.color
  }
  return color
}

function makeLinkLine (link) {
  return new maptalks.LineString(link.geometry, {
    linkId: link.LINK_ID,
    isForward: link.isForward,
    arrowStyle: [2, 2],
    arrowPlacement: 'vertex-last',
    visible: true,
    editable: true,
    cursor: null,
    shadowBlur: 0,
    shadowColor: 'black',
    draggable: false,
    dragShadow: false,
    drawOnAxis: null,
    symbol: {
      lineColor: '#1bbc9b',
      lineWidth: 3
    }
  })
}

async function getLinkIds (map, { properties }) {
  const nodeId = properties.NODE_ID
  const { features } = await mapService.getLinks(extent(map))
  const filtered = features.filter(
    feature =>
      feature.properties.ED_ND_ID === nodeId ||
      feature.properties.ST_ND_ID === nodeId
  )

  return filtered.map(feature => {
    const { properties, geometry } = feature
    const { ST_ND_ID } = properties

    properties.isForward = ST_ND_ID === nodeId

    return {
      LINK_ID: properties.LINK_ID,
      LANE: properties.LANE,
      // geometry: geometry.coordinates[0], // from MultiLineString
      geometry: geometry.coordinates,
      isForward: properties.isForward || false
    }
  })
}

export default function SaltTrafficLightsLoader (map, element, events) {
  const addLayer = addLayerTo(map)
  const trafficLightsLayer = addLayer('trafficLightsLayer')
  const linkLayer = addLayer('tmpLinkLayer')
  const signalGroupLayer = addLayer('signalGroupLayer')
  // signalGroupLayer.hide()
  new maptalks.control.Toolbar({
    position: 'top-right',
    items: [
      {
        item: '연동교차로 ',
        click: () => toggleGroupLayer()
      }
    ]
  }).addTo(map)
  const show = () => trafficLightsLayer.show()
  const hide = () => trafficLightsLayer.hide()

  const groups = signalGroups.map(group => {
    const area = makeGroupPolygon(group)
    area.on('click', e => {
      events.$emit('signalGroup:clicked', e.target.properties)
    })
    return area
  })

  map.on('zoomend', event => {
    if (event.to < 14) {
      hide()
    } else {
      show()
    }
  })

  signalGroupLayer.addGeometry(groups)

  const selectConnection = async target => {
    const linkIds = await getLinkIds(map, target.owner)
    const lines = linkIds.map(makeLinkLine)
    linkLayer.clear()
    linkLayer.addGeometry(lines)
    map.addLayer(linkLayer)
  }

  const editConnection = async target => {
    const { owner } = target
    const [x, y] = owner.toGeoJSONGeometry().coordinates
    const linkIds = await getLinkIds(map, target.owner)

    const junction = { id: owner.properties.NODE_ID, x, y }

    const lines = linkIds.map(link => makeLinkLine(link))

    linkLayer.clear()
    linkLayer.addGeometry(lines)
    map.addLayer(linkLayer)
    events.$emit('junction:selected', {
      junction,
      linkIds
    })
  }

  const deleteConnection = target => {
    const { owner } = target
    const [x, y] = owner.toGeoJSONGeometry().coordinates

    events.$emit('junction:delete', {
      id: owner.properties.NODE_ID,
      x,
      y
    })
  }

  function makeTrafficLight (feature, color) {
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
            markerFillOpacity: 1
          }
        ])
        e.target.bringToFront()
      })
      .on('mouseout', e => {
        e.target.updateSymbol([
          {
            markerFillOpacity: 0.7,
            textName: ''
          }
        ])
      })
    // .setMenu({
    //   items: [
    //     {
    //       item: `선택(${feature.properties.NODE_ID.substring(0, 10)})`,
    //       click: editConnection
    //     }
    //   ]
    // })
    // .openMenu()

    trafficLight.properties = feature.properties
    return trafficLight
  }

  async function load () {
    if (!trafficLightsLayer.isVisible()) {
      return
    }
    const { features } = await mapService.getTrafficLights(extent(map))
    trafficLightsLayer.clear()
    const geometries = features.map(feature => {
      const color = groupColor(feature.properties.NODE_ID)

      const trafficLight = makeTrafficLight(feature, color)
      return trafficLight
    })
    trafficLightsLayer.addGeometry(geometries)
  }

  const toggleGroupLayer = () => {
    if (signalGroupLayer.isVisible()) {
      signalGroupLayer.hide()
    } else {
      signalGroupLayer.show()
    }
  }

  const layer = new OptStatusLayer('hello')

  function setOptJunction (junctionIds) {
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
  function clearOptJunction () {
    layer.setData([])
  }

  function setCurrentLoads (loads) {}

  map.on('zoomend moveend', load)

  return {
    load,
    show,
    hide,
    toggleGroup: toggleGroupLayer,
    setOptJunction,
    clearOptJunction,
    setCurrentLoads
  }
}
