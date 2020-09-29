//    Junction Service API
//    get or update signal information on data platform server
//    2019

const axios = require('axios');

const { signalService: { urlBase } } = require('../../config');

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
