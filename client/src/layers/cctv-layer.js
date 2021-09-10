
import * as maptalks from 'maptalks'

import color from '@/utils/colors'

export default (map, getEdges, eventBus) => {
  const layer = new maptalks.VectorLayer('cctvLayer', [])
  const center = map.getCenter()
  const circle = new maptalks.Circle(center.add(0.002, 0.008), 20, {
    symbol: {
      lineColor: '#34495e',
      lineWidth: 2,
      polygonFill: '#1bbc9b',
      polygonOpacity: 0.4
    }
  })

  circle.on('click', (x) => {
    eventBus.$emit('cctv:selected', circle)
  })

  layer.addGeometry(circle)

  map.on('zoomend moveend', (event) => {
  })

  layer.updateRealtimeData = (data) => {

  }

  return layer
}
