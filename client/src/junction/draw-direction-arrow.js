
// const { degree, radians } = require('./utils');
import utils from './utils';

const { degree, radians } = utils;

function drawArrow(ctx, ratio = 1) {
  ctx.moveTo(0, 4 * ratio);
  ctx.lineTo(ratio, 4 * ratio);
  ctx.lineTo(0, 5 * ratio);
  ctx.lineTo(-ratio, 4 * ratio);
  ctx.lineTo(0, 4 * ratio);
  ctx.lineTo(0, 0);
}

function drawDirectionArrow(ctx, edges, network, nodes) {
  ctx.strokeStyle = 'skyblue';
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  edges.forEach((edge) => {
    ctx.save();
    const positions = network.getPositions([edge.from]);
    const fromNode = nodes.get(edge.from);
    const { angle, x, y } = fromNode;
    ctx.beginPath();
    const offsetX = 45 * Math.cos(angle);
    const offsetY = 45 * Math.sin(angle);
    ctx.translate(x + offsetX, y + offsetY);
    ctx.rotate(radians(edge.angle - 90) + fromNode.angle);
    // ctx.moveTo(0, 8);
    // ctx.lineTo(2, 8);
    // ctx.lineTo(0, 10);
    // ctx.lineTo(-2, 8);
    // ctx.lineTo(0, 8);
    // ctx.lineTo(0, 0);
    drawArrow(ctx, 3.5);

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

// module.exports = drawDirectionArrow;

export default drawDirectionArrow;
