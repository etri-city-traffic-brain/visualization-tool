const debug = require('debug')('salt-connector:connector');
const chalk = require('chalk');

const cookSimulationResult = require('../main/simulation-manager/cook');
const { getSimulation, updateStatus } = require('../globals');

const startWebSocketServer = require('./ws-server');
const startSlatMessageReceiver = require('./tcp-server');
const saltMsgFactory = require('./msg-factory');

const read = require('../main/signal-optimization/read-reward')

const { saltPath: { output }} = require('../config')
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
  const webSocketServer = startWebSocketServer(httpServer);

  // send to simulator
  webSocketServer.on('salt:set', (data) => {
    tcpServer.send(data.simulationId, saltMsgFactory.makeSet(data))
  })

  webSocketServer.on('salt:stop', (data) => {
    try {
      tcpServer.send(data.simulationId, saltMsgFactory.makeStop(data))
    } catch(err) {
      console.log(err)
    }
  })

  const optMap = {}
  // send to web
  tcpServer.on('salt:status', async (data) => {
    let { simulationId } = data
    debug(simulationId);
    webSocketServer.send(data.simulationId, { ...data })

    if(data.status === 1 && data.progress >= 100) {
      debug('*** SALT FINISHED ***')

      const simulation = getSimulation(simulationId)
      if (!simulation) {
        debug('cannot find simulation', simulation)
        return;
      }

      const { type, configuration } = simulation
      if(type ==='optimization') {
        const xxx = optMap[simulationId] || { count: 0 }
        optMap[simulationId] = xxx
        xxx.count += 1;
        updateStatus(simulationId, 'running', {epoch: xxx.count})
        if(xxx.count >= 3) {
          debug('*** OPTIMIZATION FINISHED***')
          updateStatus(simulationId, 'finished')
          webSocketServer.send(simulationId, {
            event: 'optimization:finished'
          })
        }


        const data = await read(simulationId)
        webSocketServer.send(simulationId, {
          event: 'optimization:epoch',
          data
        })
      } else {
        try {
          await cookSimulationResult({
            simulationId,
            duration: configuration.end,
            period: configuration.period,
          });
          // just for test
          updateStatus(simulationId, 'finished')
          webSocketServer.send(simulationId, {
            event: 'salt:finished'
          })
        } catch (err) {
          debug(err.message)
        }
      }
    }
  });

  // send to web
  tcpServer.on('salt:data', (data) => {
    webSocketServer.send(data.simulationId, { ...data })
  })
}
