const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const rseCsvFile = path.join(__dirname, 'rse.csv')
const rseGeojson = path.join(__dirname, 'rse.geojson')

async function findLinks (linkIds) {
  const collections = mongoose.connection.db.collection('ulinks')
  const links = await collections
    .find({
      'properties.LINK_ID': {
        $in: linkIds
      }
    })
    .toArray()
  return links
}

router.get('/', async (req, res) => {
  fs.readFile(rseGeojson, (err, data) => {
    if (err) {
      res.send({})
    } else {
      res.send(JSON.parse(data))
    }
  })
})

function _read () {
  fs.readFile(rseCsvFile, 'utf-8', (err, r) => {
    const re = r.split('\n').slice(1)
    console.log(re.length)
    re.forEach(r => {
      const line = r.split(',')
      const rseId = line[1]
      const linkId = line[2]
      console.log(linkId)
      if (line[2]) {
        const linkIds = line[2].split(' ')
        rseList[rseId] = linkIds
      }
    })
  })
}
async function _csvToGeoJson () {
  const rseList = {}
  const vehicles = Object.entries(rseList)

  const positionsByVehicle = {}
  for (const vehicle of vehicles) {
    const links = await findLinks(vehicle[1])
    const cooridnatesByVechicle = links.reduce((acc, cur) => {
      acc[cur.properties.LINK_ID] = cur.geometry.coordinates
      return acc
    }, {})
    const vId = vehicle[0]
    const linkIds = vehicle[1]
    let positions = positionsByVehicle[vId] || []
    linkIds.forEach(linkId => {
      positions = positions.concat(cooridnatesByVechicle[linkId])
    })
    positionsByVehicle[vId] = positions
  }
  const geoJson = _toJeoJson(positionsByVehicle)

  fs.writeFile(rseGeojson, JSON.stringify(geoJson), err => {
    if (err) {
      console.log(err)
    }
  })
}

function _toJeoJson (positionsByVehicle) {
  const geoJson = {
    type: 'FeatureCollection',
    features: []
  }
  Object.keys(positionsByVehicle).forEach(key => {
    const feature = {
      type: 'Feature',
      properties: {
        vehicleId: key
      },
      geometry: {
        type: 'LineString',
        coordinates: positionsByVehicle[key]
      }
    }
    geoJson.features.push(feature)
  })

  return geoJson
}

module.exports = router
