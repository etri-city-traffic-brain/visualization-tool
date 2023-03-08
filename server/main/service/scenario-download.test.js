const { downloadScenarioByCoordinate } = require('./scenario-downloader')

const param = {
  include: 0,
  fromDate: '20230202',
  toDate: '20230202',
  fromTime: '000000',
  toTime: '235959',
  minX: 127.3207635,
  minY: 36.355296,
  maxX: 127.3527784,
  maxY: 36.3368377,
  signal: 1
}

downloadScenarioByCoordinate(param, './tmp')
  .then(result => {
    console.log(result)
  })
  .catch(err => {
    console.log(err)
  })
