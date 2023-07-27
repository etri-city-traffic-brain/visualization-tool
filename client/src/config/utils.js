
import groupMap from './signal-group'

function findGroupId(nodeId) {
  const ooo = Object.entries(groupMap).find(([key, value]) => {
    if (value.includes(nodeId)) {
      return true
    }
  }) || {}
  return ooo[0]
}

export default {
  findGroupId
}
