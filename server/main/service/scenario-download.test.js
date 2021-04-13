
const { downloadScenarioByCoordinate } = require('./scenario-downloader')

const param = {
  include: 0,
  fromDate: '20210413',
  toDate: '20210413',
  fromTime: '070000',
  toTime: '095959',
  minX: 127.3207635,
  minY: 36.355296,
  maxX: 127.3527784,
  maxY: 36.3368377,
  signal: 1
}

downloadScenarioByCoordinate(param, '.')
  .then(result => {
    console.log(result)
  }).catch(err => {
    console.log(err)
  })
