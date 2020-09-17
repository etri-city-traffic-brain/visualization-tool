
import * as R from 'ramda';
import utils from './utils';

const { degree } = utils;

/**
 * utility function for connections
 * @param {Array} nodes vis dataset object
 */
function getCurrentConnectionSorted(nodes = [], connections = []) {
  console.log(connections.get());
  console.log(nodes.get());
  const nodeArray = nodes.get({ fields: ['id', 'angle', 'LINK_ID', 'LANE_ID'] }).map((node) => {
    let angle = degree(node.angle) + 90;
    if (angle < 0) {
      angle += 360;
    }
    const { id, LINK_ID: linkId, LANE_ID: laneId } = node;
    const cmpId = parseInt(node.id.replace('-', ''), 10);
    // console.log(cmpId, angle);
    return {
      id,
      angle,
      cmpId,
      linkId,
      laneId,
    };
  });

  const Sort = R.sortWith([
    R.ascend(R.prop('angle')),
    R.ascend(R.prop('cmpId')),
  ]);

  let connectionSorted = [];
  Sort(nodeArray).forEach((node) => {
    const sameFrom = connections.get({ filter: conn => conn.from === node.id })
      .sort((a, b) => a.direction - b.direction);
    connectionSorted = [...connectionSorted, ...sameFrom];
  });

  // const getLinkId = str => str.slice(0, str.length - 1);
  // const getLaneId = str => str.slice(str.length - 1, str.length);
  // const extractConnectionInfo = conn => ({
  //   from: getLinkId(conn.from),
  //   fromLane: getLaneId(conn.from),
  //   to: getLinkId(conn.to),
  //   toLane: getLaneId(conn.to),
  // });
  // result.map(conn => extractConnectionInfo(conn));

  return connectionSorted;
}

export default {
  getCurrentConnectionSorted,
};
