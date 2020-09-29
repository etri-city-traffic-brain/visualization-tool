import * as maptalks from 'maptalks';

import drawVehicles from './draw-vehicles';

const MAX_ZOOM = 19;

function makeCanvasLayer(map, edgeLayer, eventBus) {
  const canvasLayer = new maptalks.CanvasLayer('c', {
    forceRenderOnMoving: true,
    forceRenderOnZooming: true
  });

  let currentRoads = []

  canvasLayer.draw = function draw (context) {
    if (map.getZoom() < MAX_ZOOM) {
      return
    }

    drawVehicles({
      context,
      map,
      edges: edgeLayer.getGeometries(),
      roads: currentRoads
    })

    this.completeRender();
  };

  //draw when map is interacting
  canvasLayer.drawOnInteracting = function (context, view) {
    this.draw(context, view);
  };

  canvasLayer.show();

  if (eventBus) {
    eventBus.$on('salt:data', (data) => {
      currentRoads = data.roads
      canvasLayer.redraw()
    });
  }

  map.on('zoomend moveend', (event) => {
    const map = event.target;
    if(map.getZoom() >= MAX_ZOOM) {
      canvasLayer.show()
      edgeLayer.hide()
    } else {
      canvasLayer.hide()
      edgeLayer.show()
    }
  });

  return canvasLayer
}

export default makeCanvasLayer
