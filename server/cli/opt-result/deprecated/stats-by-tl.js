// 신호최적화 실행시 에포크별로 생성되는 시뮬레이션 결과파일을 사용해서
// 교차로(신호) 별 평균속도, 통과차량수 등의 통계정보를 생성한다.

const fs = require('fs')
const csv = require('fast-csv')
const convert = require('xml-js')
const utils = require('util')

const readFile = utils.promisify(fs.readFile)

function findTLs(tlLinks, linkId) {
  const result = []
  for (let tl in tlLinks) {
    if (tlLinks[tl].includes(linkId)) {
      result.push(tl)
    }
  }
  return result
}

// connection.xml 파일로부터 신호(TrafficLight)별 연결된 링크 목록을 생성한다.
async function buildTlLinks(filePath) {

  const xmlData = await readFile(filePath, 'utf8')
  const result1 = convert.xml2js(xmlData, { compact: true, spaces: 2 })

  const cons = result1.connections || {}

  const conns = cons.connection

  const tlLinks = {}

  conns.forEach(con => {
    const obj = con._attributes
    const links = tlLinks[obj.tl] || []
    links.push(obj.from)
    // links.push(obj.to)
    tlLinks[obj.tl] = links
  })
  return tlLinks
}

// 시뮬레이션 결과파일을 순회하면서
// 신호별 평균속도, 통과차량수, 통과시간을 계산한다.
async function buildTlInfo(map, simulationResultPath) {

  return new Promise((resolve, reject) => {
    const tlInfo = {}

    const stream = fs.createReadStream(simulationResultPath)
    let cnt = 0
    const handleData = row => {
      if (row.id && row.id === 'simulation') {
        return
      }
      cnt += 1
      if (cnt % 100000 === 0) {
        console.log(cnt)
      }

      if ((row.vehPassed * 1) === 0) {
        return
      }

      const { linkId } = subIds(row.id)

      const tls = findTLs(map, linkId)

      tls.forEach(tl => {
        const info = tlInfo[tl] || {}
        info.avgSpeed = info.avgSpeed || []
        info.vehPassed = info.vehPassed || []
        info.sumTravelTime = info.sumTravelTime || []

        tlInfo[tl] = info

        info.avgSpeed.push(Number(row.avgSpeed))
        info.vehPassed.push(Number(row.vehPassed))
        info.sumTravelTime.push(Number(row.sumTravelTime))
      })
    }

    const handleEnd = async () => {
      resolve(tlInfo)
      stream.close()
    }

    const handleError = (err) => {
      reject(err)
    }

    const transform = ([
      start,
      end,
      id,
      vehPassed,
      avgSpeed,
      avgDensity,
      waitingLength,
      waitingTime,
      sumTravelLength,
      sumTravelTime
    ]) => ({ start, id, avgSpeed, sumTravelTime, vehPassed, waitingTime })

    csv
      .fromStream(stream)
      .transform(transform)
      .on('data', handleData)
      .on('end', handleEnd)
      .on('error', handleError)
  })
}

const subIds = cellId => {
  const subIds = cellId.split('_')
  return {
    linkId: subIds[0],
    sectionId: `${subIds[0]}_${subIds[1]}`,
    cellId
  }
}

function calcAvg(tlInfos) {
  const obj = {}
  Object.entries(tlInfos).forEach(([key, value]) => {
    console.log(key, value)
    obj[key] = {
      avgSpeed: Number(avg(value.avgSpeed).toFixed(2)),
      vehPassed: sum(value.vehPassed),
      sumTravelTime: Number(avg(value.sumTravelTime).toFixed(2))
    }
  })
  return obj
}

async function main(home, optId, region) {
  const tlConnection = `${home}/data/${optId}/scenario/${region}/${region}.connection.xml`
  const outputDir = `${home}/data/${optId}/output/train`
  const simResult = `${outputDir}/${optId}_PeriodicOutput.csv`

  const tlLinks = await buildTlLinks(tlConnection)
  const tlInfos = await buildTlInfo(tlLinks, simResult)

  const avgByTl = calcAvg(tlInfos)
  save(avgByTl, outputDir)
}

// 결과를 파일에 저장한다.
// 기존에 json 형태의 파일이 있으면 파일 이름의 번호를 증가시킨다.
async function save(avgByTl, targetDir) {
  const files = fs.readdirSync(targetDir).filter(path => path.match(/\.json$/) !== null)
  const length = files.length
  const data = JSON.stringify(avgByTl, false, 2)
  const resultFile = `${targetDir}/tl_stats_${length}.json`
  fs.writeFileSync(resultFile, data)
}

function avg(arr) {
  return arr.reduce((a, c) => {
    return a + c
  }, 0) / arr.length
}

function sum(arr) {
  return arr.reduce((a, c) => {
    return a + c
  }, 0)
}

process.on('message', async (message) => {
  try {
    await main(message.home, message.optId, message.region)
  } catch (err) {
    console.log(err)
  } finally {
    process.exit(1)
  }
})

// main('OPTI_202306_00106', 'doan')
// main('test', 'doan')
