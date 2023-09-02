//  tss.xml 파일로부터
//  신호 아이디 및 신호 그룹 추출 및 저장

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

function xmlToJson(file) {
  const xmlData = fs.readFileSync(file, 'utf8')

  const result1 = convert.xml2js(xmlData, { compact: true, spaces: 2 })

  const signals = Object.create(null)
  const groups = Object.create(null)


  result1.trafficSignalSystem.trafficSignal.forEach(r => {
    const nodeId = r._attributes.nodeID
    const crossName = r._attributes.crossName
    const groupName = r._attributes.signalGroup

    let newGroupName = groupName
    if (groupName !== ' ') {
      newGroupName = refine(groupName)
      const nodeIds = groups[newGroupName] || []
      nodeIds.push(nodeId)
      groups[newGroupName] = nodeIds
    }

    signals[nodeId] = {
      crossName,
      groupName: newGroupName
    }
  })
  return {
    groups,
    signals
  }
}

module.exports = xmlToJson



// console.log(group)
// fs.writeFileSync('signalGroup.json', JSON.stringify(group, false, 2))
// console.log(result.signals)
// console.log(Object.keys(result.signals).length)
// fs.writeFileSync('nodeid2name.json', JSON.stringify(result, false, 2))
