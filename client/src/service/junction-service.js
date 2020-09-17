/*!
 * Service API
 *
 */
import axios from 'axios';
import queryString from 'query-string';

const baseUrl = '/salt/v1/junction';
// const { log } = console;

async function getSignal(junctionId = [], version = 0) {
  // try {
  const query = queryString.stringify({
    signal_id: junctionId,
    version,
  });
  return axios.get(`${baseUrl}/signal?${query}`);
  // } catch (err) {
  //   log(err.message);
  // }
  // return null;
}

async function deleteSignal(signalId, version) {
  const query = queryString.stringify({
    signal_id: signalId,
    version
  });
  return axios.delete(`${baseUrl}/signal?${query}`);
}


async function getSignalInfo(junctionId = []) {
  // try {
  const query = queryString.stringify({
    signal_id: junctionId,
  });
  return axios.get(`${baseUrl}/signalinfo?${query}`)
  // } catch (err) {
  //   log(err.message);
  // }
  // return [];
}

async function updateSignal(data = {}) {
  return axios({
    url: `${baseUrl}/signal`,
    method: 'post',
    data,
  });
}




async function getConnections(junctionId = []) {
  const query = queryString.stringify({
    junction_id: junctionId,
  });
  const { data } = await axios.get(`${baseUrl}/connection?${query}`);
  if (data) {
    return data.map(conn => ({
      from: conn.fromLinkId,
      fromLane: +conn.fromLaneNum,
      to: conn.toLinkId,
      toLane: +conn.toLaneNum,
    }));
  }
}

export default {
  getSignal,
  deleteSignal,
  getSignalInfo,
  saveSignal: updateSignal,
  getConnections,
  updateSignal,
};
