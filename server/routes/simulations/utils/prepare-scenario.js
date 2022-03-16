
const fs = require('fs')
const util = require('util')
const unzip = util.promisify(require('extract-zip'))
const {
  // downloadScenarioByRegion: download,
  downloadScenarioByCoordinate: download
} = require('../../../main/service/scenario-downloader')
const refineDate = text => text.replace(/-/g, '')
const refineTime = text => text.replace(/:/g, '')

// const refineParam = param => ({
//   include: 0,
//   fromDate: refineDate(param.fromDate),
//   toDate: refineDate(param.toDate),
//   fromTime: refineTime(param.fromTime),
//   toTime: refineTime(param.toTime),
//   region: param.region,
//   partitions: param.partitions,
//   subregion: 0,
//   signal: 1,
//   route: 1,
//   event: 1,
//   weather: 1
// })

const refineParam = param => ({
  include: 0,
  fromDate: refineDate(param.fromDate),
  toDate: refineDate(param.toDate),
  fromTime: refineTime(param.fromTime),
  toTime: refineTime(param.toTime),
  region: param.region,
  minX: 127.3207635,
  minY: 36.355296,
  maxX: 127.3527784,
  maxY: 36.3368377,
  signal: 1
})

/**
 * 시나리오 파일(.zip)을 다운로드한 후
 * 시뮬레이션 디렉토리(dir)에 압축해제 한다.
 */

module.exports = async (dir, configuration) => {
  const path = await download(refineParam(configuration), dir)
  await unzip(path, { dir })
}
