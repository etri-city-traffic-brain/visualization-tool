
import { HTTP } from '@/http-common'

const base = '/salt/v1/optimization'

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

async function runFixed (optId) {
  return HTTP.post(`${base}/fixed?id=${optId}&mode=fixed`)
}

async function runTest (optId, modelNum) {
  return HTTP.post(`${base}/test?id=${optId}&modelNum=${modelNum}&mode=test`)
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

export default {
  runTrain,
  runFixed,
  runTest,
  getPhase,
  getReward
}
