const router = require('express').Router()
const createError = require('http-errors')

const fs = require('fs')
const path = require('path')
const { config } = require('../../globals')

const vdsFile = config.base + '/vds/vds2link.csv'
console.log(config.base)
let result = null

router.get('/', (req, res) => {
  if (result) {
    res.send(result)
    return
  }
  fs.readFile(vdsFile, 'utf-8', (err, data) => {
    if (err) {
      console.log(err.message)
      res.send(createError(500, 'fail to read file'))
      return
    }
    const lines = data.split('\n')
    result = lines.reduce((acc, line) => {
      const row = line.split(',')
      acc[row[0]] = {
        vdsId: row[1],
        sectionId: row[2],
        sId: row[3],
        dId: row[4]
      }
      return acc
    }, {})
    res.send(result)
  })
})

router.get('/speed/:vdsId', (req, res) => {
  const vdsPath = path.join(config.base, 'vds')
  const vdsId = req.params.vdsId
  const prefix = 'SPD_15MIN_'

  fs.readdir(vdsPath, (err, files) => {
    if (err) {
      res.send([])
    }
    const targetFile = files.find(file => {
      console.log(file, '==>', prefix + vdsId)
      if (file.indexOf(prefix + vdsId) >= 0) {
        return true
      }
      return false
    })

    if (targetFile) {
      const tFile = path.join(vdsPath, targetFile)
      const str = fs.readFileSync(tFile, 'utf-8')
      const lines = str.split('\n')
      const l2 = lines.slice(1)
      res.send(l2.map(l => l.split(',')))
    } else {
      res.send([])
    }
  })
})

router.get('/volume/:vdsId', (req, res) => {
  const vdsPath = path.join(config.base, 'vds')
  const vdsId = req.params.vdsId
  const prefix = 'VOL_15MIN_'

  fs.readdir(vdsPath, (err, files) => {
    if (err) {
      res.send([])
    }
    const targetFile = files.find(file => {
      if (file.indexOf(prefix + vdsId) >= 0) {
        return true
      }
      return false
    })

    if (targetFile) {
      const tFile = path.join(vdsPath, targetFile)
      const str = fs.readFileSync(tFile, 'utf-8')
      const lines = str.split('\n')
      const l2 = lines.slice(1)
      res.send(l2.map(l => l.split(',')))
    } else {
      res.send([])
    }
  })
})

module.exports = router
