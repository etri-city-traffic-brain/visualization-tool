
import { roundRect } from '../draw-utils'

class Vehicle {
  constructor({start, angle, color, length, width}) {
    this.start = start
    this.angle = angle
    this.color = color
    this.length = length
    this.width = width
  }
  draw(context) {
    this.drawStart(context)
    this.drawBasic(context)
    if(this.drawMe) {
      this.drawMe(context)
    }
    this.drawEnd(context)
  }

  drawBasic(context) {
    // context.beginPath()
    // context.arc(this.start.x, this.start.y, 2, 0, 2 * Math.PI);
    // context.fillStyle = 'blue';
    // context.fill();

    context.translate(this.start.x, this.start.y - 0);
    context.rotate(this.angle);
    context.fillStyle = this.color
    context.fillRect(0 + 2, 0 - this.width / 2, this.length, this.width);
    roundRect(context, 0 + 2, 0 - this.width / 2, this.length, this.width,5, true)

    // context.restore()
  }

  drawStart(context) {
    context.save()
  }
  drawEnd(context) {
    context.restore()
  }
}

export default Vehicle
