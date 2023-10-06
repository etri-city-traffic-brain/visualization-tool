
// last modified: 2023-10-06

const fs = require('fs')

function feature(NODE_ID, coordinates, crossName, groupName = '') {
  return {
    type: 'Feature',
    properties: {
      VERSION: 20231006,
      NODE_ID,
      NAME: crossName,
      GROUP: groupName
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  }
}

const signalCsv = fs.readFileSync('./signallist_v3.csv', 'utf-8')

const features = signalCsv.split('\n').map((row) => {
  const values = row.split(',')

  const [nodeId, crossName, groupName, x, y] = values
  const groupNameNew = 'SA ' + groupName

  return feature(nodeId, [Number(x), Number(y)], crossName, groupNameNew)
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

if (require.main === module) {
  fs.writeFileSync('signals_v3.geojson', JSON.stringify(geoJson, false, 2))
}
