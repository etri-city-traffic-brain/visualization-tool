import { HTTP } from '@/http-common'

const base = '/salt/v1/optimization'
const { console } = window
async function runTrain (optId) {
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

async function runFixed (mId, optId) {
  return HTTP.post(`${base}/fixed?slaveId=${optId}&id=${mId}&mode=fixed`)
}

async function runTest (mId, optId, modelNum) {
  return HTTP.post(
    `${base}/test?slaveId=${mId}&id=${mId}&modelNum=${modelNum}&mode=test`
  )
}

async function stop (id, type) {
  if (type) {
    return HTTP.post(`${base}/stop?id=${id}&type=${type}`)
  }
  return HTTP.post(`${base}/stop?id=${id}`)
}

async function getPhase (optId, type) {
  return HTTP.get(`${base}/phase?id=${optId}&type=${type}`)
  // return [
  //   [0,1,2,3,4,5,6,7], // step
  //   [ 10, 20, 30, 100, 30, 20, 10 ],
  //   [ 2,3,4,5,6,7,8 ]
  // ]
}

async function getReward (optId) {
  return HTTP.get(`${base}/reward?id=${optId}`)
  // return [10, 20, 30, 100, 30, 20, 10]
}
async function getRewardTotal (optId) {
  return HTTP.get(`${base}/reward/total?id=${optId}`)
  // return [10, 20, 30, 100, 30, 20, 10]
}

// type one of 'ft' or 'rl'
async function getPhaseReward (optId, type = 'ft') {
  return HTTP.get(`${base}/phasereward?id=${optId}&type=${type}`)
}

export default {
  runTrain,
  runFixed,
  runTest,
  getPhase,
  getReward,
  getRewardTotal,
  getPhaseReward,
  stop
}
