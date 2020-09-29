import Vehicle from './vehicle'

class Bus extends Vehicle {
  constructor({ start, angle }) {
    super({
      start,
      angle,
      color: '#1E90FF',
      length: 40,
      width: 12
    })
  }

  drawMe(context) {
    context.fillStyle = '#E8E8E8'
    context.fillRect(0 + 6, -4, 22, 8);
  }

}

export default Bus
