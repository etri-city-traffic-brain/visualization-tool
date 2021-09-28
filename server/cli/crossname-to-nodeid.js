const parser = require('fast-xml-parser')
const fs = require('fs')
const xmlData = fs.readFileSync('tss.xml', 'utf8')
const he = require('he')

const convert = require('xml-js')

const result1 = convert.xml2js(xmlData, { compact: true, spaces: 2 })

console.log(result1.trafficSignalSystem.trafficSignal[0])

const result = Object.create(null)

result1.trafficSignalSystem.trafficSignal.forEach(r => {
  result[r._attributes.nodeID] = r._attributes.crossName
})

fs.writeFileSync('nodeid2name.json', JSON.stringify(result, false, 2))
