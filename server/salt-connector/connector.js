const debug = require('debug')('salt-connector:connector');
const chalk = require('chalk');

const startWebSocketServer = require('./ws-server');
const startSlatMessageReceiver = require('./tcp-server');

const saltMsgFactory = require('./msg-factory');

const { notifySimulationFinished } = require('../main/service/simulation-service')

const cookSimulationResult = require('../main/simulation-manager/cook');

const { getSimulations, updateStatus, getSimulation } = require('../globals');


/**
 * SALT connector server
 * connect simulator and web browser
 *
 * @param {Object} param
 * @param {number} param.tcpPort
 */

module.exports = (httpServer, tcpPort) => {
  debug(chalk.yellow('Connector service start'));
  const tcpServer = startSlatMessageReceiver(tcpPort);
  const wss = startWebSocketServer(httpServer);

  // send to simulator
  wss.on('salt:set', (data) => {
    tcpServer.send(data.simulationId, saltMsgFactory.makeSet(data))
  })

  // send to web
  tcpServer.on('salt:status', async (data) => {
    debug(data);
    data.event = 'salt:status'
    wss.send(data.simulationId, data)

    if(data.status === 1 && data.progress === 100) {
      debug('*** SALT FINISHED ***')
      try {
        // await notifySimulationFinished(data.simulationId)
      } catch (err) {
        debug(err.message)
      }

      let { simulationId } = data

      const simulation = getSimulation(simulationId)
      if (!simulation) {
        next();
        return;
      }

      try {
        updateStatus(simulationId, '처리중...');
        await cookSimulationResult({
          simulationId: simulationId,
          duration: simulation.configuration.end,
          period: simulation.configuration.period,
        });
      } catch (err) {
        console.log(err.message)
        updateStatus(simulationId, 'error', { error: err.message });
      }

    }

  });

  // send to web
  tcpServer.on('salt:data', (data) => {
    data.event = 'salt:data'
    wss.send(data.simulationId, data)
  })
}
