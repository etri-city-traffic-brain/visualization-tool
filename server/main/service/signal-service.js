//    Junction Service API
//    get or update signal information on data platform server
//    2019

/**
 * get or update signal information on data platform server
 */
const axios = require('axios');

const { config: { signalService: { urlBase } } } = global.SALT;

/**
 * http://14.33.200.254:9900/rest.api/getSignal?signal_id=571600441&version=1
 * http://14.33.200.254:9900/rest.api/getSignalInfo?signal_id=571600441
 * http://14.33.200.254:9900/rest.api/getConnection?junction_id=571600441
 * http://14.33.200.254:9900/rest.api/updateSignal
 */

// const urlBase = 'http://14.33.200.254:9900/rest.api';

async function getSignal(signalId, version = 1) {
  return axios.get(`${urlBase}/getSignal?signal_id=${signalId}&version=${version}`);
}

async function removeSignal(signalId, version = 1) {
  return axios.post(`${urlBase}/deleteSignal?signal_id=${signalId}&version=${version}`);
}

async function getSignalInfo(signalId) {
  return axios.get(`${urlBase}/getSignalInfo?signal_id=${signalId}`);
}

async function getConnection(junctionId) {
  return axios.get(`${urlBase}/getConnection?junction_id=${junctionId}`);
}

async function updateSignal(data) {
  return axios({
    url: `${urlBase}/updateSignal`,
    method: 'post',
    data,
  });
}

module.exports = {
  getSignal,
  getSignalInfo,
  getConnection,
  updateSignal,
  removeSignal,
};
