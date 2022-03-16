import * as maptalks from 'maptalks'

const symbolOrigin = {
  lineWidth: 2,
  lineColor: 'orange',
  textSize: 12,
  textFill: 'orange',
  polygonOpacity: 0.4
}

const symbolHighlight = {
  lineWidth: 12,
  lineColor: 'skyblue',
  textSize: 20,
  polygonFill: 'skyblue',
  textFill: 'skyblue',
  polygonOpacity: 0.4
}

function VdsLayer (map, getEdges, eventBus) {
  const layer = new maptalks.VectorLayer('vds2', [])

  layer.updateRealtimeData = () => {
    layer.clear()
    const circles = getEdges()
      .map(edge => {
        let circle
        if (edge.properties.vdsId) {
          const c = edge.getCoordinates()
          const p2 = c[0]
          const p1 = c[c.length - 1]

          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)

          const x = Math.cos(angle - Math.PI / 2) * 30
          const y = Math.sin(angle - Math.PI / 2) * 30
          circle = new maptalks.Circle(edge.getCenter(), 20, {
            symbol: {
              ...symbolOrigin,
              textName: edge.properties.vdsId,
              textPlacement: edge.properties.vdsId,
              textDy: y,
              textDx: x
            }
          })
          circle.on('mouseover', ({ target: t }) =>
            t.updateSymbol(symbolHighlight)
          )
          circle.on('mouseout', ({ target: t }) => t.updateSymbol(symbolOrigin))
          circle.on('click', ({ target: t }) => {
            t.animate(
              { symbol: { polygonOpacity: 1, textSize: 80 } },
              { duration: 1000 },
              frame => {
                if (frame.state.playState === 'finished') {
                  t.updateSymbol(symbolOrigin)
                }
              }
            )
            eventBus.$emit('vds:selected', edge)
          })
          return circle
        }
        return null
      })
      .filter(d => d !== null)
    layer.addGeometry(circles)
  }
  return layer
}

export default (map, getEdges, eventBus) => {
  const layer = VdsLayer(map, getEdges, eventBus)
  layer.show()
  return layer
}
