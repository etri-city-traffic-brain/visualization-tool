

// const urlBase = 'http://183.111.177.141:8080/rest.api';
const urlBase = 'http://solufine.duckdns.org:9900/rest.api';
const axios = require('axios');
const FormData = require('form-data');

async function getSignal(signalId, version = 1) {
  return axios.get(
    `${urlBase}/getSignal?signal_id=${signalId}&version=${version}`,
  );
}

async function removeSignal(signalId, version = 1) {
  return axios.post(
    `${urlBase}/deleteSignal?signal_id=${signalId}&version=${version}`,
  );
}

async function getSignalInfo(signalId) {
  return axios.get(`${urlBase}/getSignalInfo?signal_id=${signalId}`);
}

async function getConnection(junctionId) {
  return axios.get(`${urlBase}/getConnection?junction_id=${junctionId}`);
}

async function updateSignal(data) {
  const formData = new FormData();
  formData.append('uploadFile', JSON.stringify(data), {
    filename: 'signal',
    contentType: 'application/json',
  });

  try {
    const result = await axios({
      url: `${urlBase}/updateSignalFile`,
      method: 'post',
      data: formData,
      headers: formData.getHeaders(),
    });
    console.log(result.data);
  } catch (err) {
    console.log(err);
  }
}
async function updateSignal2(data) {
  // const formData = new FormData();
  // formData.append('uploadFile', JSON.stringify(data), {
  //   filename: 'signal',
  //   contentType: 'application/json',
  // });

  try {
    const result = await axios({
      url: `${urlBase}/updateSignal`,
      method: 'post',
      data,
      // headers: formData.getHeaders(),
    });
    console.log(result);
  } catch (err) {
    console.log(err);
  }
}

(async () => {
  // const { data } = await getSignalInfo(SIGNAL_ID);
  // console.log(data);
  const SIGNAL_ID = '572700225'; // 한영중학고교앞
  const VERSION = 1;
  // const { data } = await getSignal(SIGNAL_ID, VERSION);
  // data.version = '3';
  // console.log(JSON.stringify(data, false, 2));
  try {
    const { data } = await removeSignal('1111', 1);
    console.log(data);
  } catch (err) {
    console.log(err);
  }
  // await updateSignal2(data);
})();
