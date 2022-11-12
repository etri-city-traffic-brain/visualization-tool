const router = require('express').Router()
const readline = require('readline')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const { config } = require('../../globals')

async function readDtgData (file) {
  return new Promise((resolve, reject) => {
    const reader = readline.createInterface({
      input: fs.createReadStream(file),
      // output: process.stdout,
      console: false
    })

    const map = {}
    reader
      .on('line', function (line) {
        const columns = line.split(',')
        const linkId = columns[0]

        const density = map[linkId] || 0
        if (density === 0) {
          map[linkId] = 1
        } else {
          map[linkId] += 1
        }
      })
      .on('error', function (e) {
        reject(e)
      })

    reader.on('close', function () {
      resolve(map)
    })
  })
}

router.get('/dtg', (req, res) => {
  const date = req.query.date || '2019-08-01'
  const tDate = date.split('-').join('')
  const f = 'dtg_' + tDate + '.csv'
  const dtgFile = path.join(config.base, 'dtg', '201908', f)
  readDtgData(dtgFile)
    .then(result => res.send(result))
    .catch(e => res.status(500).send(e.message))
})

async function fileExists (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.F_OK, err => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      resolve()
      //file exists
    })
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

function _saveFile (path, geoJson) {
  fs.writeFile(path, JSON.stringify(geoJson), err => {
    if (err) {
      console.log(err)
    }
    console.log('save dtg geojson file')
  })
}

router.get('/dtg/by/vehicleid', async (req, res) => {
  const date = req.query.date || '2019-08-01'
  const tDate = date.split('-').join('')
  const inputFile = 'dtg_' + tDate + '.csv'
  const outputFile = 'dtg_' + tDate + '.geojson'
  const file = path.join(config.base, 'dtg', '201908', inputFile)
  const output = path.join(config.base, 'dtg', '201908', outputFile)

  try {
    await fileExists(output)
    console.log('file exists')

    fs.readFile(output, (err, data) => {
      if (err) {
        //
      }
      res.send(JSON.parse(data))
    })
    return
  } catch (err) {
    console.log('dtg geojson file not exists')
  }

  const reader = readline.createInterface({
    input: fs.createReadStream(file),
    console: false
  })
  const collections = mongoose.connection.db.collection('ulinks')

  const map = {}
  reader
    .on('line', function (line) {
      const columns = line.split(',')
      const linkId = columns[0]
      const vId = columns[3]

      const vs = map[vId] || []
      vs.push(linkId)
      map[vId] = vs
    })
    .on('error', function (e) {})

  reader.on('close', async function () {
    const vehicles = Object.entries(map)
      .filter(x => {
        return x[1].length > 100
      })
      .slice(0, 200)

    async function fileLinks (linkIds) {
      const links = await collections
        .find({
          'properties.LINK_ID': {
            $in: linkIds
          }
        })
        .toArray()
      return links
    }
    const positionsByVehicle = {}
    for (const vehicle of vehicles) {
      const links = await fileLinks(vehicle[1])

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

    console.log('save', output, geoJson)
    _saveFile(output, geoJson)

    console.log(geoJson)
    res.send(geoJson)
  })
})

module.exports = router
