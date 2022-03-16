import Vehicle from './vehicle'

class Car extends Vehicle {
  constructor ({ start, angle }) {
    super({
      start,
      angle,
      // color: '#FF8C00',
      color: 'skyblue',
      length: 16,
      width: 6
    })
  }

  drawMe (context) {
    context.fillStyle = 'black'
    context.fillRect(0 + 5, -3, 4, 6)
    context.fillRect(0 + 16, -3, 2, 6)
  }
}

export default Car
