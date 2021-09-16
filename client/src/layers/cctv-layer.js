
import * as maptalks from 'maptalks'

// import color from '@/utils/colors'
import axios from 'axios'

// import cctvImg from '@/assets/images/cctv.png'
// console.log(cctvImg)
export default (map, getEdges, eventBus) => {
  const layer = new maptalks.VectorLayer('cctvLayer', [])
  const center = map.getCenter()

  axios({
    url: '/salt/v1/cctv',
    method: 'get'
  }).then(res => res.data)
    .then(data => {
      data.forEach(cctv => {
        // const circle = new maptalks.Circle(cctv.location, 20, {
        //   symbol: {
        //     lineColor: '#34495e',
        //     lineWidth: 2,
        //     polygonFill: 'red',
        //     polygonOpacity: 0.4
        //   }
        // }).addTo(layer)

        const marker4 = new maptalks.Marker(
          cctv.location,
          {
            symbol: {
              markerFile: cctv.icon,
              markerWidth: 28,
              markerHeight: 40,
              markerDx: 0,
              markerDy: 0,
              markerOpacity: 1
            }
          }
        ).addTo(layer)

        // console.log('add circle', cctv.location)
        marker4.on('click', (x) => {
          eventBus.$emit('cctv:selected', {
            ...cctv
          })
        })

        // layer.addGeometry(circle)
      })
    })

  map.on('zoomend moveend', (event) => {
  })

  layer.updateRealtimeData = (data) => {

  }

  return layer
}
