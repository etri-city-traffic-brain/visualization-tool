// 신호 최적화 상태 시각화 레이어
import * as maptalks from 'maptalks'

const options = {
  animation: true,
  color: ['LightPink', 'LightGreen', 'Orange', 'Red', 'Black'],
  p: ['▖', '▖', '▘', '▝', '▗', '▗'],
  // p: ['▘', '▘▘', '▘▘▘', '▘▘▘▘'],
  font: '20px san-serif'
}

class OptStatusLayer extends maptalks.Layer {
  constructor(id, data, options) {
    super(id, options)
    this.data = data
  }

  setData(data) {
    this.data = data
    return this
  }

  getData() {
    return this.data
  }
}

OptStatusLayer.mergeOptions(options)

let angle = 0
class OptStatusLayerRenderer extends maptalks.renderer.CanvasRenderer {
  checkResources() {
    return []
  }

  draw() {
    const colors = this.layer.options.color
    const now = Date.now()
    const rndIdx = Math.round(now / 300 % colors.length)
    const color = colors[rndIdx]
    const p = this.layer.options.p[rndIdx]
    const drawn = this._drawData(this.layer.getData(), color, p)
    this._drawnData = drawn
    this.completeRender()
  }

  drawOnInteracting(evtParam) {
    if (!this._drawnData || this._drawnData.length === 0) {
      return
    }
    const colors = this.layer.options.color
    const now = Date.now()
    const rndIdx = Math.round(now / 300 % colors.length)
    const color = colors[rndIdx]
    this._drawData(this._drawnData, color)
  }

  onSkipDrawOnInteracting() { }

  needToRedraw() {
    if (this.layer.options.animation) {
      return true
    }
    return super.needToRedraw()
  }

  _drawData(data, color, p) {
    if (!Array.isArray(data)) {
      return
    }
    const map = this.getMap()
    this.prepareCanvas()
    const ctx = this.context
    ctx.fillStyle = color
    ctx.font = this.layer.options.font

    const containerExtent = map.getContainerExtent()
    const drawn = []
    data.forEach(d => {
      const point = map.coordinateToContainerPoint(new maptalks.Coordinate(d.coord))
      if (!containerExtent.contains(point)) {
        return
      }
      // const text = d.text + (p || '')
      // const len = ctx.measureText(text)
      // ctx.fillText(text, point.x - len.width / 2, point.y)
      drawn.push(d)

      // radar
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.fillStyle = 'skyblue'
      ctx.globalAlpha = 0.5
      ctx.translate(point.x - 3, point.y + 15)
      angle += 0.5
      ctx.rotate((Math.PI / 180) * angle)
      ctx.moveTo(0, 0)
      const y = map.distanceToPoint(0, 50, map.getZoom())
      ctx.arc(0, 0, y.y, (Math.PI / 180) * (angle % 360), (Math.PI / 180) * (360), true)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    })

    return drawn
  }
}

OptStatusLayer.registerRenderer('canvas', OptStatusLayerRenderer)

export default OptStatusLayer
