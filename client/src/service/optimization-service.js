
import { HTTP } from '@/http-common';

const base = '/salt/v1/optimization'

async function runTrain(optId) {
  return HTTP.post(`${base}/train?id=${optId}`);
}

async function runFixed(optId) {
  return HTTP.post(`${base}/fixed?id=${optId}`);
}

async function runTest(optId, modelNum) {
  return HTTP.post(`${base}/test?id=${optId}&modelNum=${modelNum}`);

}

export default {
  runTrain,
  runFixed,
  runTest,
}
