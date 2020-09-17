/*!
 * Simulation Runner
 * run simulater on the remote server
 *
 */
const debug = require('debug')('api:simulation-run');
const { Client } = require('ssh2');

const {
  config: {
    saltPath: {
      data,
    },
    salt: {
      standalone,
      distributed,
      python,
    },
  },
} = global.SALT;

module.exports = ({
  simulationId, vmInfo, partitions, masterPort, workerPort,
}) => new Promise(async (resolve, reject) => {
  const client = new Client();
  const configFile = `${data}/${simulationId}/salt.config.json`;
  const scenarioFile = `${data}/${simulationId}/salt.scenario.json`;
  let command;
  try {
    if (partitions > 0) {
      command = `${python} ${distributed} -c ${configFile} -s ${scenarioFile} -mp ${masterPort} -wp ${workerPort}`;
    } else {
      command = `${python} ${standalone} -c ${configFile} -s ${scenarioFile}`;
    }
    debug(command);
  } catch (err) {
    debug(err);
    reject(err);
  }

  const logs = [];
  const ready = () => {
    client.exec(command, (err, stream) => {
      if (err) {
        client.end();
        return reject(err);
      }

      stream
        .on('end', () => client.end())
        .on('error', err => reject(new Error(err.toString() + logs.join('\n'))))
        .on('close', () => { resolve(logs); client.end(); })
        .on('data', (data) => {
          debug('data', data.toString());
          logs.push(data.toString());
        })
        .stderr
        .on('data', (err) => {
          reject(new Error(err.toString() + logs.join('\n')));
        });

      // simulation can be taken long time
      setTimeout(() => { resolve(logs); }, 3000);
      return null;
    });
  };
  try {
    debug('connect to', vmInfo);
    client.on('ready', ready).connect(vmInfo);
    client.on('error', (e) => {
      reject(new Error(`cannot connect to simulator by ssh ${e.message}`));
    });
  } catch (err) {
    reject(err);
    throw err;
  }
});
