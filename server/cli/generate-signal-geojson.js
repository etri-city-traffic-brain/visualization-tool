// tss.xml 파일로 부터 geoJson 생성

const fs = require('fs')

const xmlToJson = require('./tssXmlToJson')

function feature(NODE_ID, coordinates, signal) {
  return {
    type: 'Feature',
    properties: {
      VERSION: 20150128,
      NODE_ID,
      NAME: signal?.crossName,
      GROUP: signal?.groupName
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  }
}

const signalInfo = xmlToJson('tss.xml')

const { signals } = signalInfo

const signalCsv = fs.readFileSync('./signallist.csv', 'utf-8')

const features = signalCsv.split('\n').map((row) => {
  const values = row.split(',')

  const [nodeId, x, y] = values

  const signal = signals[nodeId]

  return feature(nodeId, [Number(x), Number(y)], signal)
})

const geoJson = {
  type: 'FeatureCollection',
  name: 'mnodes',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
    },
  },
  features,
}

//  CSV 형태의 노드 목록을 GEO JSON 객체로 변환한다.
if (require.main === module) {
  fs.writeFileSync('signals_v2.geojson', JSON.stringify(geoJson, false, 2))
}
