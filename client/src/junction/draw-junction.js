function drawJunction(ctx, junction) {
  const points = lanes.map(lane => {
    return [lane.x, lane.y]
  });
  const j = hull(points);
  ctx.save();
  ctx.fillStyle = '#A6D5F7';
  ctx.strokeStyle = '#A6D5F7';

  ctx.fill();
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = '20px Arial';
  ctx.fillStyle = 'blue';
  ctx.translate(junction.x, lane.y)
  ctx.rotate(lane.angle);
  ctx.fillText(junction.id, 0, 0);
  ctx.restore()

}

// module.exports = drawJunction;
export default drawJunction;
