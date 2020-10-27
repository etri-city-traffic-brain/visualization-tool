import * as maptalks from 'maptalks';
// import extent from '../map-extent';
import drawVehicles from './draw-vehicles';

const MAX_ZOOM = 19;

function Container() {
  let _data = []

  return {
    set(data) {
      _data = data

    },
    get() {
      return _data
    }
  }
}

function makeCanvasLayer(map, getEdges, realtimeEdgeData) {
  const canvasLayer = new maptalks.CanvasLayer('c', {
    forceRenderOnMoving: true,
    forceRenderOnZooming: true
  });

  canvasLayer.draw = function draw(context) {
    drawVehicles({
      context,
      map,
      getEdges,
      getEdgesRealtime: realtimeEdgeData.get
    })

    canvasLayer.completeRender();
  };

  canvasLayer.drawOnInteracting = (context, view) => canvasLayer.draw(context, view);
  return canvasLayer
}

export default (map, getEdges, eventBus, extent) => {
  let realtimeEdgeData = Container()
  const canvasLayer = makeCanvasLayer(map, getEdges, realtimeEdgeData)

  canvasLayer.show();

  if (eventBus) {
    eventBus.$on('salt:data', (data) => {
      console.log(data)
      realtimeEdgeData.set(data.roads)
      canvasLayer.redraw()
    });
  }

  map.on('zoomend moveend', () => {
    if(map.getZoom() >= MAX_ZOOM - 1) {
      canvasLayer.show()
    } else {
      canvasLayer.hide()
    }
    if (eventBus) {
      eventBus.$emit('salt:set', {
        extent: extent(map),
        zoom: map.getZoom()
      })
    }
  });

  return canvasLayer
}
