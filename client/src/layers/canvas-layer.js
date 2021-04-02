import * as maptalks from 'maptalks'

import drawVehicles from './draw-vehicles'

const MAX_ZOOM = 20

function makeCanvasLayer (map, getEdges) {
  const canvasLayer = new maptalks.CanvasLayer('c', {
    forceRenderOnMoving: true,
    forceRenderOnZooming: true
  })

  let realtimeEdgeData = {}

  canvasLayer.draw = function draw (context) {
    drawVehicles({
      context,
      map,
      getEdges,
      realtimeEdgeData: realtimeEdgeData
    })

    canvasLayer.completeRender()
  }

  canvasLayer.drawOnInteracting = (context, view) => {
    canvasLayer.draw(context, view)
  }

  canvasLayer.updateRealtimeData = (data) => {
    realtimeEdgeData = data
    canvasLayer.redraw()
  }

  return canvasLayer
}

export default (map, getEdges) => {
  const canvasLayer = makeCanvasLayer(map, getEdges)

  canvasLayer.show()

  map.on('zoomend moveend', () => {
    // if (map.getZoom() >= MAX_ZOOM) {
    //   canvasLayer.show()
    // } else {
    //   canvasLayer.hide()
    // }
  })

  return canvasLayer
}
