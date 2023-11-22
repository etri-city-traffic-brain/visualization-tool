//  tss.xml 파일로부터
//  신호 아이디 및 신호 그룹 추출

const fs = require('fs')

const convert = require('xml-js')

function refine(groupName) {
  let newGroupName
  if (groupName.indexOf('SA ') >= 0) {
    newGroupName =
      'SA ' +
      Number(
        groupName
          .split(' ')
          .join('')
          .slice(2)
      )
  } else if (groupName.indexOf('SA') >= 0) {
    const second = groupName.slice(2).replace('#', '')
    newGroupName = 'SA ' + Number(second)
  } else {
    newGroupName = 'SA ' + Number(groupName)
  }
  return newGroupName
}

// 주어진 tss.xml 파일로부터 신호그룹 목록을 추출하여 반환
function extractSignalGroups(filePath) {
  const group = Object.create(null)
  try {
    const xmlData = fs.readFileSync(filePath, 'utf8')
    const result1 = convert.xml2js(xmlData, { compact: true, spaces: 2 })

    result1.trafficSignalSystem.trafficSignal.forEach(r => {
      const nodeId = r._attributes.nodeID
      const crossName = r._attributes.crossName
      const groupName = r._attributes.signalGroup

      if (groupName !== ' ') {
        const newGroupName = refine(groupName)
        const nodeIds = group[newGroupName] || []
        nodeIds.push({
          nodeId,
          crossName
        })
        group[newGroupName] = nodeIds
      }
    })
  } catch (err) {
    console.log(err.message)
  }

  return group
}

module.exports = {
  extractSignalGroups
}

if (require.main === module) {
  const region = 'doan'
  const path = `/home/ubuntu/uniq-simv2/data/scenario/${region}/${region}.tss.xml`
  const groups = extractSignalGroups(path)
  console.log(groups)
}
