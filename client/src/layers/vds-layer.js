import * as maptalks from 'maptalks'

function Layer (map, getEdges) {
  const canvasLayer = new maptalks.CanvasLayer('vds', {
    forceRenderOnMoving: true,
    forceRenderOnZooming: true
  })

  canvasLayer.draw = function draw (ctx) {
    ctx.font = 'bolder 14px sans-serif'
    ctx.strokeStyle = 'blue'
    ctx.fillStyle = 'blue'
    getEdges()
      .forEach(edge => {
        if (edge.properties.vdsId) {
          const p = map.coordinateToContainerPoint(edge.getCenter())
          const c = edge.getCoordinates()
          const p2 = c[0]
          const p1 = c[c.length - 1]

          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)

          const x = Math.cos(angle - Math.PI / 2) * 25
          const y = Math.sin(angle - Math.PI / 2) * 25

          ctx.save()
          ctx.beginPath()
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2, true)
          ctx.translate(p.x + x, p.y + y)

          ctx.fillText(edge.properties.vdsId, 0, 0)
          ctx.stroke()
          ctx.fill()
          ctx.restore()
        }
      })

    this.completeRender()

    canvasLayer.completeRender()
  }

  canvasLayer.drawOnInteracting = (context, view) => {
    canvasLayer.draw(context, view)
  }

  canvasLayer.updateRealtimeData = () => {
    canvasLayer.redraw()
  }

  return canvasLayer
}

function text (str, pos) {
  return new maptalks.Marker(
    pos,
    {
      properties: {
        name: str
      },
      symbol: {
        textFaceName: 'sans-serif',
        textName: '{name}', // value from name in geometry's properties
        textWeight: 'normal', // 'bold', 'bolder'
        textStyle: 'normal', // 'italic', 'oblique'
        textSize: 15,
        textFont: null, // same as CanvasRenderingContext2D.font, override textName, textWeight and textStyle
        textFill: '#34495e',
        textOpacity: 1,
        // textHaloFill: '#fff',
        textHaloFill: '#ff0',
        textHaloRadius: 5,
        textWrapWidth: null,
        textWrapCharacter: '\n',
        textLineSpacing: 0,

        textDx: 0,
        textDy: 0,

        textHorizontalAlignment: 'middle', // left | middle | right | auto
        textVerticalAlignment: 'middle', // top | middle | bottom | auto
        textAlign: 'center' // left | right | center | auto
      }
    }
  )
}

function Layer2 (map, getEdges, eventBus) {
  const layer = new maptalks.VectorLayer('vds2', [])

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
