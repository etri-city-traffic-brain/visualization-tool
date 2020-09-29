import * as maptalks from 'maptalks';
// import extent from '../map-extent';
import drawVehicles from './draw-vehicles';

const MAX_ZOOM = 19;

export default (map, getEdges, eventBus, extent) => {
  const layer = new maptalks.CanvasLayer('c', {
    forceRenderOnMoving: true,
    forceRenderOnZooming: true
  });

  let currentRoads = []

  layer.draw = function draw(context) {
    if (map.getZoom() < MAX_ZOOM) {
      return
    }

    drawVehicles({
      context,
      map,
      edges: getEdges(),
      roads: currentRoads
    })

    this.completeRender();
  };

  //draw when map is interacting
  layer.drawOnInteracting = function drawOnInteracting(context, view) {
    this.draw(context, view);
  };

  layer.show();

  if (eventBus) {
    eventBus.$on('salt:data', (data) => {
      currentRoads = data.roads
      layer.redraw()
    });
  }

  map.on('zoomend moveend', () => {
    if(map.getZoom() >= MAX_ZOOM) {
      layer.show()
    } else {
      layer.hide()
    }
    if (eventBus) {
      eventBus.$emit('salt:set', {
        extent: extent(map),
        zoom: map.getZoom()
      })
    }
  });

  return layer
}
