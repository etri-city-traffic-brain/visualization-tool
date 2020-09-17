/*!
 * GENERATE LANES
 */

import utils from './utils';

const { angleBetween } = utils;
const { floor } = Math;
const OFFSET_FIRST = 90;
const OFFSET_SECOND = 200;

function makeLane(edge) {
  const { geometry, isForward } = edge;

  const p1 = { x: geometry[0][0], y: geometry[0][1] * -1 };
  const p2 = { x: geometry[1][0], y: geometry[1][1] * -1 };
  const angle = angleBetween(p2, p1);
  const cosValue = Math.cos(angle);
  const sinValue = Math.sin(angle);
  return {
    id: edge.id,
    x: floor(OFFSET_FIRST * cosValue),
    y: floor(OFFSET_FIRST * sinValue),
    ex: floor(OFFSET_SECOND * cosValue),
    ey: floor(OFFSET_SECOND * sinValue),
    angle: angleBetween(p2, p1),
    isForward,
    lanes: edge.LANE,
    LINK_ID: edge.LINK_ID,
  };
}

export default {
  makeLane,
};
