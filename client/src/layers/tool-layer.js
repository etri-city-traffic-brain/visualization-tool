
import * as maptalks from 'maptalks'

export default (map, getGeometries, eventBus) => {

  const layer = new maptalks.VectorLayer('toolLayer', [])

  const circle = new maptalks.Circle(map.getCenter(), 80,{
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

  // const convertArrayToObject = (array, key) => {
  //   const initialValue = {};
  //   return array.reduce((obj, item) => {
  //     return {
  //       ...obj,
  //       [item[key]]: item,
  //     };
  //   }, initialValue);
  // };

  let edgesFocused = null
  circle.on('dragend', () => {
    edgesFocused = getGeometries()
      .filter(isInside)
      .reduce((acc, edge) => {
        acc[edge.properties.LINK_ID] = edge
        return acc
      }, {})
  });

  layer.toggleFocusTool = () => {
    circle.setCoordinates(map.getCenter())
  }

  layer.updateRealtimeData = (realtimeEdgeData) => {
    if(edgesFocused == null) {
      edgesFocused = {}
      getGeometries().forEach(obj => {
        if(circle.containsPoint(obj.getFirstCoordinate()) || circle.containsPoint(obj.getLastCoordinate())) {
          edgesFocused[obj.properties.LINK_ID] = obj
        }
      })
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
    // circle.startEdit({
    //   fixAspectRatio: true,
    // })

    setTimeout(() => {
      // circle.endEdit()
    }, 3000)
  }

  return layer
};
