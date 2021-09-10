
const router = require('express').Router()
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const {
  config
} = require('../../globals')

async function readDtgData (file) {
  return new Promise((resolve, reject) => {
    const reader = readline.createInterface({
      input: fs.createReadStream(file),
      // output: process.stdout,
      console: false
    })

    const map = {}
    reader.on('line', function (line) {
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
  console.log(f)
  const dtgFile = path.join(config.base, 'dtg', '201908', f)
  readDtgData(dtgFile)
    .then((result) => res.send(result))
    .catch(e => res.status(500).send(e.message))
})

module.exports = router
