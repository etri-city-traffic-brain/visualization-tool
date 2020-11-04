
import * as maptalks from 'maptalks'

import array2Obj from '@/utils/array2obj'

export default (map, getGeometries, eventBus) => {

  const layer = new maptalks.VectorLayer('toolLayer', [])

  const circle = new maptalks.Circle(map.getCenter(), 80, {
    draggable: true,
    symbol: {
      lineColor: '#34495e',
      lineWidth: 1,
      polygonFill: '#1bbc9b',
      polygonOpacity: 0.2,
      textSize: 20,
      textDy: -20
    }
  });

  const isFocused = circle => geometry =>
    circle.containsPoint(geometry.getFirstCoordinate()) ||
    circle.containsPoint(geometry.getLastCoordinate())

  const isInside = isFocused(circle)

  let edgesFocused = null

  const setEdgesFocused = value => {
    edgesFocused = value
  }

  const updateEdgeFocused = () => {
    setEdgesFocused(
      array2Obj(
        getGeometries().filter(isInside),
        ['properties', 'LINK_ID']
      )
    )
  }

  circle.on('dragend', () => {
    updateEdgeFocused()
  });

  layer.toggleFocusTool = () => {
    circle.setCoordinates(map.getCenter())
  }

  layer.updateRealtimeData = (realtimeEdgeData) => {
    if(edgesFocused == null) {
      updateEdgeFocused()
    }
    const roadsRealtime = Object.values(realtimeEdgeData)
    const { speed, vehicles, roadsFocused } = roadsRealtime.reduce((acc, cur) => {
      if(edgesFocused[cur.roadId]) {
        acc.roadsFocused.push(cur)
        acc.speed += cur.speed;
        acc.vehicles += cur.numVehicles;
      }
      return acc
    }, { speed: 0, vehicles: 0, roadsFocused: []})

    const avgSpeed = speed / roadsRealtime.length;

    if(eventBus) {
      eventBus.$emit('map:focus', {
        speed: (avgSpeed).toFixed(2),
        vehicles,
        realTimeEdges: roadsFocused
      })
    }
  }

  layer.addGeometry([circle])

  layer.startEdit = () => {
    circle.startEdit({
      fixAspectRatio: true,
    })
  }

  return layer
};
