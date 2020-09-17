/*!
 * Generate lanes from link
 *
 * Copyright(c) 2019-2019 Modutech
 * Copyright(c) 2019-2019 ETRI
 *
 */
import nodeOption from './lane-node-option';

import utils from './utils';

const { angleBetween } = utils;
const { floor } = Math;

const OFFSET_FIRST = 350;
const OFFSET_SECOND = 570;
const OFFSET_CENTER = 5;
const LANE_WIDTH = 8;

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

function generateLanes(links = []) {
  const lanes = [];
  links.forEach((link) => {
    const lane = makeLane(link);
    for (let i = 0; i < lane.lanes; i += 1) {
      lane.id = `${lane.LINK_ID}${lane.lanes - i - 1}`;

      const angle = (lane.angle + Math.PI / 2); // adjust angle

      const direction = lane.isForward ? -1 : 1;

      const offsetX = OFFSET_CENTER * Math.cos(angle) * direction * LANE_WIDTH;
      const offsetY = OFFSET_CENTER * Math.sin(angle) * direction * LANE_WIDTH;

      lane.x += offsetX;
      lane.y += offsetY;
      lane.ex += offsetX;
      lane.ey += offsetY;
      lanes.push({
        ...lane,
        ...nodeOption,
        LINK_ID: link.LINK_ID,
        lane: lane.lanes -i - 1,
        label: ' ' + (lane.lanes - i -1) + ' ',
        font:{ size: 35, color: 'white' },
        shape: 'circle',
        color: 'black',
      });
    }
  });
  return lanes;
}

export default generateLanes;
