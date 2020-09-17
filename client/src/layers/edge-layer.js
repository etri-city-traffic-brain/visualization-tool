// import * as maptalks from '../map/maptalks';

import * as maptalks from 'maptalks'

import color from '@/utils/colors';

function updateCongestion(edgeLayer, map, linkSpeeds = {}, step = 0) {
  const geometries = edgeLayer.getGeometries()
  const zoom = map.getZoom();
  const alpha = (Math.abs(17 - zoom) + 1.5) * 2
  geometries.forEach((geometry) => {
    const speeds = linkSpeeds[geometry.getId()] || [];
    const speed = speeds[step];
    if(speed) {
      let lineColor = color(speeds[step]) || 'gray';
      if (speed >= 60) {
        lineColor = 'green'
      }
      geometry.updateSymbol({
        lineColor,
        lineWidth: alpha,
        'markerPlacement' : 'vertex-last', //vertex, point, vertex-first, vertex-last, center
        lineDasharray : []
      });
    } else {
      geometry.updateSymbol({
        lineWidth: 1,
        'markerPlacement' : 'vertex-last', //vertex, point, vertex-first, vertex-last, center
        // lineDasharray : [5, 5]
      });
    }
  });
}

function uuu(edgeLayer, map, edgeSpeeds = {}) {
  edgeLayer.getGeometries().forEach((edge) => {
    const road = edgeSpeeds[edge.getId()];
    if(road) {
      edge.updateSymbol({
        lineColor: color(road.speed),
        lineWidth: 4,
      });
    }
  });
}


export default (map, eventBus) => {

  const layer = new maptalks.VectorLayer('edgeLayer', [], {
    enableAltitude: true,
    drawAltitude: {
      polygonFill: '#1bbc9b',
      polygonOpacity: 0.3,
      lineWidth: 0,
    },
  })

  map.on('zoomend moveend', (event) => {
    const map = event.target;
    if(map.getZoom() >= 20 || map.getZoom() <= 14) {
      layer.hide()
    } else {
      layer.show()
    }
  });

  layer.updateCongestion = (currentSpeedsPerLink, currentStep) => {
    updateCongestion(layer, map, currentSpeedsPerLink, currentStep)
  }

  if (eventBus) {
    eventBus.$on('salt:data', (data) => {
      let roadMap = data.roads.reduce((acc, cur) => {
        acc[cur.roadId] = cur
        return acc
      }, {})

      uuu(layer, map, roadMap)
    });
  }

  return layer
};
