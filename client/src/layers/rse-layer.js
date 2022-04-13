import * as maptalks from 'maptalks'
import axios from 'axios'

function getColorCode () {
  const makeColorCode = '0123456789ABCDEF'
  let code = '#'
  for (let count = 0; count < 6; count++) {
    code = code + makeColorCode[Math.floor(Math.random() * 16)]
  }
  return code
}

function Layer2 (map, getEdges, eventBus) {
  const layer = new maptalks.VectorLayer('rse', [], {
    enableAltitude: true,
    drawAltitude: {
      polygonFill: '#1bbc9b',
      polygonOpacity: 0.3,
      lineWidth: 0
    }
  })

  axios({
    url: '/salt/v1/rse',
    method: 'get'
  })
    .then(res => res.data)
    .then(data => {
      // vdsTable = data
      const geoJson = maptalks.GeoJSON.toGeometry(data)
      geoJson.forEach(g => {
        const c = getColorCode()
        g.updateSymbol({
          lineWidth: 5,
          lineColor: c,
          textName: g.properties.vehicleId,
          textSize: 12,
          textFill: c,
          textHaloFill: '#fff',
          textHaloRadius: 2
        })
        g.setInfoWindow({
          title: 'RSE구간',
          content: g.properties.vehicleId
        })
        g.on('click', ({ target }) => {
          console.log(target)
        })
        g.properties.altitude = Math.random() * 200
      })
      layer.addGeometry(geoJson)
    })

  map.on('zoomend moveend', () => {})
  return layer
}

export default (map, getEdges, eventBus) => {
  const layer = Layer2(map, getEdges, eventBus)
  layer.show()
  return layer
}
