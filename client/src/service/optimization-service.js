import { HTTP } from '@/http-common'

const base = '/salt/v1/optimization'
const { console } = window
async function runTrain(optId) {
  // console.group('신호 최적화 요청')
  console.log('시뮬레이션 아이디:', optId)
  try {
    const res = await HTTP.post(`${base}/train?id=${optId}&mode=train`)
    console.groupEnd()
    return res
  } catch (err) {
    const { response } = err
    console.log(response.status, response.data)
    console.groupEnd()
    throw new Error('fail to signal optimization request')
  }
}

async function runFixed(mId, optId) {
  return HTTP.post(`${base}/fixed?slaveId=${optId}&id=${mId}&mode=fixed`)
}

async function runTest(mId, optId, modelNum) {
  return HTTP.post(
    `${base}/test?slaveId=${mId}&id=${mId}&modelNum=${modelNum}&mode=test`
  )
}

async function stop(id, type) {
  if (type) {
    return HTTP.post(`${base}/stop?id=${id}&type=${type}`)
  }
  return HTTP.post(`${base}/stop?id=${id}`)
}

async function getPhase(optId, type) {
  return HTTP.get(`${base}/phase?id=${optId}&type=${type}`)
  // return [
  //   [0,1,2,3,4,5,6,7], // step
  //   [ 10, 20, 30, 100, 30, 20, 10 ],
  //   [ 2,3,4,5,6,7,8 ]
  // ]
}

async function getReward(optId) {
  return HTTP.get(`${base}/reward?id=${optId}`)
  // return [10, 20, 30, 100, 30, 20, 10]
}
async function getRewardTotal(optId) {
  return HTTP.get(`${base}/reward/total?id=${optId}`)
  // return [10, 20, 30, 100, 30, 20, 10]
}

// type one of 'ft' or 'rl'
async function getPhaseReward(optId, type = 'ft') {
  return HTTP.get(`${base}/phasereward?id=${optId}&type=${type}`)
}

async function getSigOptResult(optId) {
  return HTTP.get(`${base}/result?id=${optId}`)
  // return {
  //   summary: {
  //     improvement_rate: 10,
  //     simulate: {
  //       avg_speed: 10,
  //       travel_time: 10
  //     },
  //     test: {
  //       avg_speed: 10,
  //       travel_time: 10
  //     }
  //   },

  //   total: {
  //     simulate: [], // step 별 평균 통과시간
  //     simulate_avg: 10,
  //     test: [],
  //     test_avg: 10
  //   },

  //   intersections: {
  //     '신성네거리': {
  //       simulate: 10,
  //       test: 20,
  //       improvement_rate: 19.2,
  //       cumulative_avg: [],
  //       signal_explain: {}
  //     }
  //   }

  // }
}
function getOptTrainResult(optId, epochNum) {
  // return [
  //   {
  //     name: '상대초교(단)',
  //     SA: 'SA 101',
  //     ftVehPassed: 2778,
  //     ftAvgTravelTime: 10.81,
  //     rlAvgTravelTime: 12.68,
  //     improvedRate: -17.36
  //   },
  //   {
  //     name: '원골(단)',
  //     SA: 'SA 101',
  //     ftVehPassed: 2838,
  //     ftAvgTravelTime: 38.01,
  //     rlAvgTravelTime: 28.83,
  //     improvedRate: 24.15
  //   }

  // ]

  return HTTP.get(`${base}/optTrainResult?id=${optId}&epoch=${epochNum}`).then(res => res.data)
}

function getOptTestResult(optId, epoch) {
  return HTTP.get(`${base}/optTestResult?id=${optId}&epoch=${epoch}`).then(res => res.data)
}

function getOptTestResults(optId) {
  return HTTP.get(`${base}/optTestResults?id=${optId}`).then(res => res.data)
}

function getScenario() {
  return HTTP.get(`${base}/scenario`).then(res => res.data)
}

function getSignalGroups(region) {
  return HTTP.get(`${base}/signal/groups/${region}`).then(res => res.data)
}

export default {
  runTrain,
  runFixed,
  runTest,
  getPhase,
  getReward,
  getRewardTotal,
  getPhaseReward,
  stop, getSigOptResult,
  getOptTrainResult,
  getScenario,
  getSignalGroups,
  getOptTestResult,
  getOptTestResults
}
