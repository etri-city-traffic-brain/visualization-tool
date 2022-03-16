
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
    // choose north direction
    // Math.PI / 2 = (1.570)90 degree means north
    const target = nodes.get().find(v => v.angle > 1.5 && v.angle < 1.7)

    const lanes = nodes.get().map(xx => {
      const angle = xx.angle - target.angle
      return {
        ...xx,
        angle: angle * (180 / Math.PI)
      }
    })

    const outOfRanges = lanes.filter(v => v.angle > target.angle)
    const remains = lanes.filter(v => v.angle <= target.angle)

    const lanesRefined = outOfRanges.map(lane => ({
      ...lane,
      angle: lane.angle - 360
    }))

    remains.push(...lanesRefined)
    const conns = Sort(remains).map(node => {
      return connections
        .get({ filter: conn => conn.from === node.id })
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
