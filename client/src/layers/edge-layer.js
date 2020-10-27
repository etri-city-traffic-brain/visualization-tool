
import * as maptalks from 'maptalks'

import color from '@/utils/colors';

const calcLineWidth = zoom => (Math.abs(17 - zoom) + 1.5) * 1.5

function updateCongestion(edgeLayer, map, linkSpeeds = {}, step = 0) {
  const lineWidth = calcLineWidth(map.getZoom())
  edgeLayer.getGeometries().forEach((geometry) => {
    const speeds = linkSpeeds[geometry.getId()] || [];
    const speed = speeds[step];
    if(speed) {
      let lineColor = color(speeds[step]) || '#808080';
      geometry.updateSymbol({
        lineWidth,
        lineColor,
        markerPlacement: 'vertex-last', //vertex, point, vertex-first, vertex-last, center
        lineDasharray: []
      });
    } else {
      geometry.updateSymbol({
        lineWidth: 2,
        lineColor: '#808080',
        markerPlacement: 'vertex-last', //vertex, point, vertex-first, vertex-last, center
        lineDasharray: [5, 5]
      });
    }
  });
}

function updateRealtimeSpeed(edgeLayer, speedByEdgeId = {}, zoom) {
  edgeLayer.getGeometries().forEach((geometry) => {
    const road = speedByEdgeId[geometry.getId()];
    if(road) {
      geometry.updateSymbol({
        lineWidth: calcLineWidth(zoom),
        lineColor: color(road.speed),
      });
    }
  });
}


export default (map, eventBus) => {

  const edgeLayer = new maptalks.VectorLayer('edgeLayer', [])

  map.on('zoomend moveend', (event) => {
    const map = event.target;
    if(map.getZoom() >= 19 || map.getZoom() <= 14) {
      // layer.hide()
    } else {
      // layer.show()
    }
  });

  edgeLayer.updateCongestion = (currentSpeedsPerLink, currentStep) => {
    updateCongestion(edgeLayer, map, currentSpeedsPerLink, currentStep)
  }

  if (eventBus) {
    eventBus.$on('salt:data', (data) => {
      let roadMap = data.roads.reduce((acc, cur) => {
        acc[cur.roadId.trim()] = cur
        return acc
      }, {})

      updateRealtimeSpeed(edgeLayer, roadMap, map.getZoom())
    });
  }

  return edgeLayer
};
