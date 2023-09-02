/**
 * download scenario
 *
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

const {
  scenarioService: {
    urlBaseForScenarioByRegion,
    urlBaseForScenarioByCoordinate
  }
} = require('../../config')

const { log } = console

async function download(url, targetDir = './') {
  const targetFilePath = path.resolve(targetDir, 'data.zip')
  log(`${url}`)
  try {
    const { data } = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    data.pipe(fs.createWriteStream(targetFilePath))

    return new Promise((resolve, reject) => {
      data.on('end', () => {
        log(targetFilePath)
        // const stats = fs.statSync(targetFilePath)
        // console.log(stats.size)
        // if (stats.size < 100) {
        //   reject(new Error('scenario file is not correct'))
        //   return
        // }
        resolve(targetFilePath)
      })
      data.on('error', error => reject(error))
    })
  } catch (error) {
    if (error.response) {
      // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
      // console.log(error.response.data);
      log(error.response.status)
      // console.log(error.response.headers);
    } else if (error.request) {
      // 요청이 이루어 졌으나 응답을 받지 못했습니다.
      // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
      // Node.js의 http.ClientRequest 인스턴스입니다.
      log(error.request)
    }

    return Promise.reject(error)
  }
}

function makeUrlForScenarioByRegion({
  include = 0,
  fromDate,
  toDate,
  fromTime,
  toTime,
  region,
  subregion,
  partitions = 1,
  signal = 0,
  route = 0,
  event = 0,
  weather = 0
}) {
  const reqestParameter = `
  ?include=${include}&
  fromDate=${fromDate}&
  toDate=${toDate}&
  fromTime=${fromTime}&
  toTime=${toTime}&
  region=${region}&
  subregion=${subregion}&
  partitions=${partitions}&
  signal=${signal}&
  route=${route}&
  event=${event}&
  weather=${weather}&`.replace(/\s/g, '')
  return `${urlBaseForScenarioByRegion}${reqestParameter}`
}

function makeUrlForScenarioByCoordinate(
  {
    include = 0,
    fromDate,
    toDate,
    fromTime,
    toTime,
    // microArea: { minX, minY, maxX, maxY },

    signal = '0',
    partitions = '1',
    route = '0',
    event = '0',
    weather = '0',
    busstop = '1'
  },
  { minX, minY, maxX, maxY }
) {
  const reqestParameter = `
  ?include=${include}&
  fromDate=${fromDate}&
  toDate=${toDate}&
  fromTime=${fromTime}&
  toTime=${toTime}&
  minX=${minX}&
  minY=${minY}&
  maxX=${maxX}&
  maxY=${maxY}&
  signal=${signal}&
  busstop=${busstop}&
  weather=${weather}`.replace(/\s/g, '')

  return `${urlBaseForScenarioByCoordinate}${reqestParameter}`
}

async function downloadScenarioByRegion(param, targetDir) {
  return download(makeUrlForScenarioByRegion(param), targetDir)
}

async function downloadScenarioByCoordinate(param, area, targetDir) {
  return download(makeUrlForScenarioByCoordinate(param, area), targetDir)
}

module.exports = {
  download,
  makeUrlForScenarioByRegion,
  makeUrlForScenarioByCoordinate,
  downloadScenarioByRegion,
  downloadScenarioByCoordinate
}
