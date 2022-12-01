import * as maptalks from 'maptalks'

import color from '@/utils/colors'

// const calcLineWidth = zoom => (Math.abs(17 - zoom) + 1.5) * 1.5
const calcLineWidth = zoom => (Math.abs(17 - zoom) + 1.5) * 1

function updateCongestion (edgeLayer, map, linkSpeeds = {}, step = 0) {
  if (Object.keys(linkSpeeds).length === 0) {
    return
  }
  const lineWidth = calcLineWidth(map.getZoom())
  edgeLayer.getGeometries().forEach(geometry => {
    const speeds = linkSpeeds[geometry.getId()] || []
    let speed = speeds[step] || 0
    // let speed = road.speed
    if (geometry.properties.SPEEDLH <= 30) {
      speed = (speed / 30) * 50
    }

    if (speed) {
      const lineColor = color(speed) || '#808080'
      geometry.updateSymbol({
        lineWidth,
        lineColor,
        markerPlacement: 'vertex-last' // vertex, point, vertex-first, vertex-last, center
        // lineDasharray: [1]
      })
    } else {
      geometry.updateSymbol({
        lineWidth: 1,
        lineColor: '#808080',
        markerPlacement: 'vertex-last' // vertex, point, vertex-first, vertex-last, center
        // lineDasharray: [5, 5]
      })
    }
  })
}

export default map => {
  const edgeLayer = new maptalks.VectorLayer('edgeLayer', [], {
    enableAltitude: true,
    drawAltitude: {
      // polygonFill: '#1bbc9b',
      // polygonFill: 'blue',
      polygonFill: 'orange',
      polygonOpacity: 0.3,
      lineWidth: 0
    }
  })

  map.on('zoomend moveend', event => {
    const map = event.target
    if (map.getZoom() >= 19 || map.getZoom() <= 14) {
      // layer.hide()
    } else {
      // layer.show()
    }
  })

  function updateRealtimeSpeed (speedByEdgeId = {}) {
    edgeLayer.getGeometries().forEach(geometry => {
      let edgeId = geometry.getId()
      if (!edgeId.includes('_')) {
        // edgeId = edgeId + '_0_0'

        const ids = Object.keys(speedByEdgeId).filter(v => v.startsWith(edgeId))
        // console.log(ids)
        let speed =
          ids.reduce((ac, c) => {
            const road = speedByEdgeId[c]
            if (road) {
              ac += road.speed || 1
            }
            return ac
          }, 0) / ids.length
        if (speed) {
          if (geometry.properties.SPEEDLH <= 30) {
            // speed = road.speed * 2
            speed = (speed / 30) * 50
          }
          geometry.updateSymbol({
            lineWidth: calcLineWidth(map.getZoom()),
            lineColor: color(speed)
          })
        }
      }
      const road = speedByEdgeId[edgeId]
      if (road) {
        let speed = road.speed
        if (geometry.properties.SPEEDLH <= 30) {
          // speed = road.speed * 2
          speed = (speed / 30) * 50
        }
        geometry.updateSymbol({
          lineWidth: calcLineWidth(map.getZoom()),
          lineColor: color(speed)
        })
      }
    })
  }

  edgeLayer.updateCongestion = (currentSpeedsPerLink, currentStep) => {
    updateCongestion(edgeLayer, map, currentSpeedsPerLink, currentStep)
  }

  edgeLayer.updateRealtimeData = data => {
    updateRealtimeSpeed(data)
  }

  return edgeLayer
}
