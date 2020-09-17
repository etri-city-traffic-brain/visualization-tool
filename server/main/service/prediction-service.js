//    Cloud Server API
//    2019

const axios = require('axios');
const normalizeUrl = require('normalize-url');
const queryString = require('query-string');
const debug = require('debug')('api:cloud');
const { predictionService: { urlBase } = {} } = require('../../config');

const get = (url, query = '') => axios.get(normalizeUrl(`${urlBase}/${url}?${query}`));

const sleep = (value = 1000) => new Promise(resolve => setTimeout(() => { resolve(); }, value));

const getId = require('./link-id-table');

function getPrediction(data) {
  const newId = getId(data.linkid);

  // const newData = {
  //   ...data,
  //   linkid: newId,
  // }
  console.log(data);
  data.linkid = newId;
  console.log(`${urlBase}/prediction`);
  return axios({
    url: `${urlBase}/prediction`,
    method: 'post',
    data,
  });
}

// (async () => {
//   try {
//     const { data } = await getPrediction({
//       prediction: 'LinkSpeed',
//       model: 'HA',
//       horizon: '5',
//       linkid: '1014661',
//       timestamp: '2019-11-16 12:43:51',
//     });
//     console.log(data);
//   } catch (err) {
//     console.log(err);
//   }
// })();

module.exports = {
  getPrediction,
};
