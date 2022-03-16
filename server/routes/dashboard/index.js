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

router.get('/dtg/by/vehicleid', (req, res) => {
  const date = req.query.date || '2019-08-01'
  const tDate = date.split('-').join('')
  const f = 'dtg_' + tDate + '.csv'
  const file = path.join(config.base, 'dtg', '201908', f)

  const reader = readline.createInterface({
    input: fs.createReadStream(file),
    // output: process.stdout,
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
    // console.log(Object.keys(map)[2], Object.values(map)[2])
    const vehicles = Object.entries(map)
      .filter(x => {
        return x[1].length > 100
      })
      .slice(0, 6)
    // console.log(Object.keys(vehicles).length)
    // const vv = Object.values(vehicles)
    // console.log(vehicles)
    const obj = {}
    for (const vehicle of vehicles) {
      const rr = await collections
        .find({
          'properties.LINK_ID': {
            $in: vehicle[1]
          }
        })
        .toArray()
      const r = rr.reduce((acc, cur) => {
        acc[cur.properties.LINK_ID] = cur.geometry.coordinates
        return acc
      }, {})

      let array = obj[vehicle[0]] || []
      vehicle[1].forEach(v => {
        // r[v]
        array = array.concat(r[v])
      })

      // r.forEach(x => {
      //   array = array.concat(x.geometry.coordinates)
      // })
      obj[vehicle[0]] = array
    }
    const geoJson = {
      type: 'FeatureCollection',
      features: []
    }
    Object.keys(obj).forEach(key => {
      const feature = {
        type: 'Feature',
        properties: {
          vehicleId: key
        },
        geometry: {
          type: 'LineString',
          coordinates: obj[key]
        }
      }
      geoJson.features.push(feature)
    })

    console.log(geoJson)

    // res.send(vehicles)
    res.send(geoJson)
  })
})

module.exports = router
