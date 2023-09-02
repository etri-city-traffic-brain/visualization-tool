const {
  bboxPolygon,
  booleanPointInPolygon,
  lineString,
  multiLineString,
  featureCollection,
  lineChunk
} = require('@turf/turf')

const feature = {
  type: 'Feature',
  properties: {
    LINK_ID: '572710640',
    ST_ND_ID: '572708668',
    ED_ND_ID: '572708665',
    LANE: 1,
    SPEEDLH: 10
  },
  geometry: {
    type: 'MultiLineString',
    coordinates: [
      [
        [127.1422019829645, 37.54213182506216],
        [127.14211219951878, 37.54186953634434],
        [127.142110305851, 37.541839237659815],
        [127.14213292180062, 37.54182792968502],
        [127.14219165897632, 37.541814764455985],
        [127.14220267438053, 37.5418103582943],
        [127.14221094041137, 37.54180346993525],
        [127.14231947317066, 37.54166169290738],
        [127.1423213181406, 37.541657633973486],
        [127.14231957007236, 37.54164772825344],
        [127.1421751358717, 37.54125825396062]
      ]
    ]
  }
}

const line = multiLineString(feature.geometry.coordinates)

const chunk = lineChunk(line, 30, { units: 'meters' })
console.log(JSON.stringify(chunk, false, 2))
