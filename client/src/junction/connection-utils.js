
import * as R from 'ramda'

/**
 * utility function for connections
 * @param {Array} nodes vis dataset object
 */

export default {
  getCurrentConnectionSorted (nodes = [], connections = []) {
    const Sort = R.sortWith([
      R.descend(R.prop('angle')),
      R.ascend(R.prop('lane')),
      R.ascend(R.prop('isForward'))
    ])
    const conns = Sort(nodes.get()).map(node => {
      return connections.get({ filter: conn => conn.from === node.id })
        .sort((a, b) => {
          const aa = a.angle < 0 ? a.angle + 360 : a.angle
          const bb = b.angle < 0 ? b.angle + 360 : b.angle
          return aa - bb
        })
    }).reduce((acc, cur) => {
      acc.push(...cur)
      return acc
    }, [])
    return conns
  }
}
