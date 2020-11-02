
import * as maptalks from 'maptalks'

export default (map, getGeometries, eventBus) => {

  const layer = new maptalks.VectorLayer('toolLayer', [])

  const circle = new maptalks.Circle(map.getCenter(), 80,{
    draggable: true,
    symbol: {
      lineColor: '#34495e',
      lineWidth: 2,
      polygonFill: '#1bbc9b',
      polygonOpacity: 0.2,

      // 'textName'  : 'line',
      'textPlacement' : 'ㅌㅌㅌline',
      'textSize'  : 20,
      'textDy' : -20

    }
  });

  let selectedEdges = null
  circle.on('dragend', () => {
    selectedEdges = {}
    getGeometries().forEach(obj => {
      if(circle.containsPoint(obj.getFirstCoordinate()) || circle.containsPoint(obj.getLastCoordinate())) {
        selectedEdges[obj.properties.LINK_ID] = obj
      }
    })
  });

  layer.toggleFocusTool = () => {
    circle.setCoordinates(map.getCenter())
  }

  layer.updateRealtimeData = (realtimeEdgeData, realTimeEdges) => {
    if(selectedEdges == null) {
      selectedEdges = {}
      getGeometries().forEach(obj => {
        if(circle.containsPoint(obj.getFirstCoordinate()) || circle.containsPoint(obj.getLastCoordinate())) {
          selectedEdges[obj.properties.LINK_ID] = obj
        }
      })
    }
    const xxx = []
    const { speed, vehicles } = realTimeEdges.reduce((acc, cur) => {
      if(selectedEdges[cur.roadId]) {
        xxx.push(cur)
        acc.speed += cur.speed;
        acc.vehicles += cur.numVehicles;
      }
      return acc
    }, { speed: 0, vehicles: 0})

    const avgSpeed = speed / realTimeEdges.length;

    if(eventBus) {
      eventBus.$emit('map:focus', {
        speed: (avgSpeed).toFixed(2),
        vehicles,
        realTimeEdges: xxx
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
