import * as maptalks from 'maptalks'
import axios from 'axios'
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

let vdsTable

function VdsLayer(map, getEdges, eventBus) {
  if (!vdsTable) {
    axios({
      url: '/salt/v1/vds',
      method: 'get'
    })
      .then(res => res.data)
      .then(data => {
        // console.log(data)
        vdsTable = data
      })
  }
  const layer = new maptalks.VectorLayer('vds', [])
  setTimeout(() => update(), 1000)
  map.on('zoomend moveend', () => {
    update()
  })
  function update() {
    layer.clear()
    const circles = getEdges()
      .map(edge => {
        const vdsId = vdsTable[edge.properties.LINK_ID]
        if (vdsId) {
          edge.properties.vdsId = vdsId.vdsId
          edge.properties.secionId = vdsId.sectionId
          edge.properties.sId = vdsId.sId
          edge.properties.dId = vdsId.dId
        }

        let circle
        if (edge.properties.vdsId) {
          const c = edge.getCoordinates()
          const p2 = c[0]
          const p1 = c[c.length - 1]

          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)

          const x = Math.cos(angle - Math.PI / 2) * 30
          const y = Math.sin(angle - Math.PI / 2) * 30
          // circle = new maptalks.Circle(edge.getCenter(), 20, {
          circle = new maptalks.Circle(edge.getFirstCoordinate(), 20, {
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
