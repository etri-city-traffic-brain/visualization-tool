import * as maptalks from 'maptalks'

function Layer2 (map, getEdges, eventBus) {
  const layer = new maptalks.VectorLayer('rse-layer', [])

  layer.updateRealtimeData = () => {
    layer.clear()
    getEdges()
      .forEach(edge => {
        if (edge.properties.vdsId) {
          const c = edge.getCoordinates()
          const p2 = c[0]
          const p1 = c[c.length - 1]

          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)

          const x = Math.cos(angle - Math.PI / 2) * 30
          const y = Math.sin(angle - Math.PI / 2) * 30
          const circle = new maptalks.Circle(edge.getCenter(), 10, {
            symbol: {
              lineColor: '#34495e',
              lineWidth: 2,
              polygonFill: '#1bbc9b',
              polygonOpacity: 0.4,
              textName: edge.properties.vdsId,
              textPlacement: edge.properties.vdsId,
              textSize: 20,
              textFill: '#34495e',
              textDy: y,
              textDx: x
            }
          })
          circle.on('mouseover', (x) => {

          })
          circle.on('mouseout', (x) => {
          })
          circle.on('click', (x) => {
            const marker = x.target
            const player = marker.animate({
              symbol: {
                polygonOpacity: 1,
                textSize: 40
              }
            }, {
              duration: 200
            }, function (frame) {
              if (frame.state.playState === 'finished') {
                marker.updateSymbol({
                  lineWidth: 2,
                  polygonOpacity: 0.4,
                  textSize: 20
                })
              }
            })

            eventBus.$emit('vds:selected', edge)
          })
          layer.addGeometry(circle)
        }
      })
  }
  return layer
}

export default (map, getEdges, eventBus) => {
  const layer = Layer2(map, getEdges, eventBus)
  layer.show()
  return layer
}
