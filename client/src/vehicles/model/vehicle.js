
import { roundRect } from '../draw-utils'

class Vehicle {
  constructor ({ start, angle, color, length, width }) {
    this.start = start
    this.angle = angle
    this.color = color
    this.length = length
    this.width = width
  }

  draw (context, zoom, f) {
    this.drawStart(context)
    this.drawBasic(context, zoom, f)
    if (this.drawMe) {
      this.drawMe(context)
    }
    this.drawEnd(context)
  }

  drawBasic (context, zoom = 18, f) {
    context.translate(this.start.x, this.start.y)
    // const factor = 20 - map.getScale()
    context.scale(f, f)
    // console.log(zoom)
    // if (zoom === 17) {
    //   context.scale(0.5, 0.5)
    // }
    // if (zoom === 18) {
    //   context.scale(0.6, 0.6)
    // }
    // if (zoom === 19) {
    //   context.scale(0.7, 0.7)
    // }
    // if (zoom === 20) {
    //   context.scale(0.8, 0.8)
    // }
    context.rotate(this.angle)
    context.fillStyle = this.color
    context.fillRect(0 + 2, 0 - this.width / 2, this.length, this.width)
    roundRect(context, 0 + 2, 0 - this.width / 2, this.length, this.width, 5, true)
  }

  drawStart (context) {
    context.save()
  }

  drawEnd (context) {
    context.restore()
  }
}

export default Vehicle
