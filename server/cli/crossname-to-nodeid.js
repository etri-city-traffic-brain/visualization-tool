//  tss.xml 파일로부터
//  신호 아이디 및 신호 그룹 추출 및 저장

const fs = require('fs')
const xmlData = fs.readFileSync('tss.xml', 'utf8')

const convert = require('xml-js')

const result1 = convert.xml2js(xmlData, { compact: true, spaces: 2 })

const result = Object.create(null)
const group = Object.create(null)

function refine (groupName) {
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

result1.trafficSignalSystem.trafficSignal.forEach(r => {
  const nodeId = r._attributes.nodeID
  const crossName = r._attributes.crossName
  const groupName = r._attributes.signalGroup
  result[nodeId] = crossName

  if (groupName !== ' ') {
    const newGroupName = refine(groupName)
    const nodeIds = group[newGroupName] || []
    nodeIds.push(nodeId)
    group[newGroupName] = nodeIds
  }
})

// console.log(group)
fs.writeFileSync('signalGroup.json', JSON.stringify(group, false, 2))
// console.log(result)
// fs.writeFileSync('nodeid2name.json', JSON.stringify(result, false, 2))
