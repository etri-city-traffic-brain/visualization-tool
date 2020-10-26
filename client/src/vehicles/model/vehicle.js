
import { roundRect } from '../draw-utils'

class Vehicle {
  constructor({start, angle, color, length, width}) {
    this.start = start
    this.angle = angle
    this.color = color
    this.length = length
    this.width = width
  }
  draw(context, zoom) {
    this.drawStart(context)
    this.drawBasic(context, zoom)
    if(this.drawMe) {
      this.drawMe(context)
    }
    this.drawEnd(context)
  }

  drawBasic(context, zoom=18) {
    context.translate(this.start.x, this.start.y);
    if(zoom === 18) {
      context.scale(0.6, 0.6);
    }
    context.rotate(this.angle);
    context.fillStyle = this.color
    context.fillRect(0 + 2, 0 - this.width / 2, this.length, this.width);
    roundRect(context, 0 + 2, 0 - this.width / 2, this.length, this.width,5, true)
  }

  drawStart(context) {
    context.save()
  }
  drawEnd(context) {
    context.restore()
  }
}

export default Vehicle
