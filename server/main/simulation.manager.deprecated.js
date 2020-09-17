/**
 * spawn salt process and handle its status
 * author: beanpole
 * last modified: 2018-11-29
 */
const path = require('path');
const { spawn } = require('child-process-promise');
const moment = require('moment');

const { getSimulations } = require('./db');
const cook = require('./result.cooker');
const portfinder = require('portfinder');

const {
  base,
  salt: {
    basePort,
    highestPort,
    standalone,
    distributed,
  },
} = require('../config');

const {
  READY,
  RUNNING,
  FINISHED,
  STOPPED,
  ERROR,
} = require('./status');

function buildArgs(simulationId, isStandalone) {
  const saltCmd = isStandalone ? standalone : distributed;
  const cmdPath = path.join(base, 'helper', saltCmd);
  const configPath = path.join(base, 'data', `${simulationId}.json`);
  if (isStandalone) {
    return Promise.resolve([cmdPath, configPath]);
  }

  return new Promise((resolve, reject) => {
    portfinder.getPort({
      port: basePort, // minimum port
      stopPort: highestPort, // maximum port
    }, (error, port) => {
      if (error) {
        reject(error);
        return;
      }
      resolve([cmdPath, configPath, port, port]);
    });
  });
}

function SimulatorRunner() {
  let myStatus = READY;
  let process;
  let myId;

  async function updateStatus(id, status, error = '') {
    const ended = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    console.log('simulation ended: ', ended);
    myStatus = status;
    await getSimulations()
      .find({ id })
      .assign({ status, ended, error })
      .write();
  }

  async function run(simulation) {
    console.log('run simulator', simulation);
    const {
      id,
      configuration: {
        map,
        partition,
      },
    } = simulation;

    myId = id;

    if (myStatus === RUNNING) {
      console.log('already running');
      return;
    }
    const isStandalone = (partition * 1) === 0;
    try {
      const args = await buildArgs(id, isStandalone);
      if (!args) {
        await updateStatus(id, ERROR, 'fail to get available port');
        return;
      }
      await updateStatus(id, RUNNING);
      process = await spawn('python', args);
      await cook(id, map);
      await updateStatus(id, FINISHED);
    } catch (err) {
      await updateStatus(id, ERROR, err.message);
    }
  }

  function kill() {
    updateStatus(myId, STOPPED);
    process.kill();
  }

  function getStatus() {
    return myStatus;
  }

  return {
    run,
    kill,
    status: getStatus,
  };
}

module.exports = SimulatorRunner;


async function main() {
  const args = await buildArgs('SALT-001', true);
  await spawn('python', args);
}

if (require.main === module) {
  main();
}
