
function calcOffset (lane, ratio) {
  return {
    x: (lane.ex - lane.x) * ratio,
    y: (lane.ey - lane.y) * ratio
  }
}

function drawLane (ctx, lanes = []) {
  lanes.forEach((lane) => {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(lane.ex, lane.ey)
    ctx.lineTo(lane.x, lane.y)
    ctx.lineWidth = 40
    ctx.stroke()
    ctx.restore()

    const offsetLabel = calcOffset(lane, 0.0)

    ctx.save()
    ctx.font = '20px Arial'
    ctx.fillStyle = 'orange'

    ctx.translate(lane.x + offsetLabel.x, lane.y + offsetLabel.y)
    ctx.rotate(lane.angleLane)

    ctx.fillText(lane.LINK_ID + '(' + lane.lane + ')', 32, 5)
    ctx.restore()

    const offsetDirection = calcOffset(lane, -0.7)
    if (!lane.isForward) {
      ctx.save()
      ctx.translate(lane.x - offsetDirection.x, lane.y - offsetDirection.y)
      ctx.rotate(lane.angleLane)
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.moveTo(15 * 3, 0)
      ctx.lineTo(20 * 3, 5 * 3)
      ctx.lineTo(20 * 3, -5 * 3)
      ctx.fill()
      ctx.restore()
    }
  })
}
export default drawLane
