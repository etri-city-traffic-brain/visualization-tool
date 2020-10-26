const debug = require('debug')('salt-connector:connector');
const chalk = require('chalk');

const startWebSocketServer = require('./ws-server');
const startSlatMessageReceiver = require('./tcp-server');
const QueueManager = require('./queue-manager');
const { tcpPort, wsPort } = require('../config').server;
const config = require('../config');
const serialize = obj => JSON.stringify(obj);
const msgFactory = require('./msg-factory');
const {
  distributeData,
  distributeDataToSalt,
} = require('./msg-distributor');

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
    tcpServer.send(data.simulationId, msgFactory.makeSet(data))
  })

  // send to web
  tcpServer.on('salt:status', (data) => {
    debug(data);
    data.event = 'salt:status'
    wss.send(data.simulationId, data)
  });

  // send to web
  tcpServer.on('salt:data', (data) => {
    data.event = 'salt:data'
    wss.send(data.simulationId, data)
  })
}
