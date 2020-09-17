//    Cloud Server API
//    2019

const axios = require('axios');
const normalizeUrl = require('normalize-url');
const queryString = require('query-string');
const debug = require('debug')('api:cloud');
const { cloudService: { urlBase } = {} } = require('../../config');

const get = (url, query = '') => axios.get(normalizeUrl(`${urlBase}/${url}?${query}`));

const sleep = (value = 1000) => new Promise(resolve => setTimeout(() => { resolve(); }, value));

/* sample vm info
{
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  privateKey: require('fs').readFileSync('/here/is/my/key')
}
*/

async function getSshKey(userid) {
  if (!userid) {
    throw new Error('userid cannot be null');
  }
  const query = queryString.stringify({ userid });
  try {
    // if (!keyCached) {
    const { data } = await get(`api/saltpackage/download?userid=${userid}`);
    // keyCached = data;
    // console.log(userid, 'keyinfo:', data);
    return data;

    // return keyCached;
  } catch (err) {
    throw err;
  }
}

//    API: /api/saltpackage?userid=xxxx&partitions=xxxx
//    Response example
//    {
//      success: true,
//      data: {
//        packageName: 'string',
//        dbvmfloatIP: 'string',
//        dbvmIP: 'string',
//        masterfloatIP: 'string', // external
//        masterIP: 'string', // internal
//        workerNo: 1,
//        workerVM: [{
//          workerfloatIP: 'string', // external
//          workerIP: 'string', // internal
//        }], // workerVM
//      },
//    };

const makeVmInfo = ({ privateKey, masterVm, normalVm }) => ({
  host: masterVm.masterFloatIP,
  masterIP: masterVm.masterIP,
  port: 22,
  username: 'ubuntu',
  privateKey,
  workers: normalVm.map(vm => vm.normalFloatIP),
  workers2: normalVm.map(vm => vm.normalIP),
});


/**
 * send VM package creation request
 *
 * @param {string} userid
 * @param {number} partitions
 */
async function makePackage(userid = '', partitions = 2) {
  const query = queryString.stringify({ userid, partitions });
  const { data } = await get('/api/saltpackage', query);
  if (data.success) {
    return true;
  }
  throw new Error('fail to create vm partitions:', partitions);
}

async function getVmInfo(userid = '', partitions = 2) {
  // const query = queryString.stringify({ userid, partitions });
  // try {
  //   const { data } = await get('/api/saltpackagecheck', query);
  //   if (!data.success) {
  //     throw new Error(`fail to retrieve vm package info for user: ${userid}`);
  //   }

  //   const {
  //     data: {
  //       masterVm, normalVm,
  //     },
  //     success,
  //   } = data;

  //   if (!success) {
  //     throw new Error('fail to retrive package info');
  //   }
  //   const privateKey = await getSshKey(userid);
  //   return makeVmInfo({ privateKey, masterVm, normalVm });
  // } catch (err) {
  //   debug(err.message);
  //   throw err;
  // }

  return {
    host: '127.0.0.1',
    masterIP: '127.0.0.1',
    port: 22,
    username: 'ubuntu',
    privateKey: '',
    workers: [],
    workers2: [],
  };
}


/**
 * check packate status periodically
 *
 * @param {String} userId
 */
async function checkPackage(userid, partitions) {
  const MAX_TRY_COUNT = 20;
  const PERIOD = 3000;
  let count = 0;

  const query = queryString.stringify({ userid, partitions });

  async function check(userid, period) {
    // if (count >= MAX_TRY_COUNT) {
    //   throw new Error('exceed miximum retry count to check package');
    // }

    count += 1;
    debug(`try to check vm status, count: ${count}`);
    try {
      const { data } = await get('/api/saltpackagecheck', query);
      if (data.success) {
        return {
          masterVm: data.data.masterVm,
          normalVm: data.data.normalVm,
        };
      }
      await sleep(period);
      return await check(userid, period);
    } catch (err) {
      throw err;
    }
  }
  await sleep(PERIOD);
  return check(userid, PERIOD);
}

module.exports = {
  getVmInfo,
  getSshKey,
  checkPackage,
  makePackage,
  makeVmInfo,
};
