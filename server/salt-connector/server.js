const debug = require('debug')('salt-connector:server');
const chalk = require('chalk');

const WebSocketServer = require('./ws-server');
const TcpServer = require('./tcp-server');
const QueueManager = require('./queue-manager');
const { tcpPort, wsPort } = require('../config').server;

const serialize = obj => JSON.stringify(obj);

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
 * @param {number} param.wsPort
 */
function Server({ tcpPort, wsPort }) {
  debug(chalk.yellow('server start'));
  const queueManager = QueueManager();

  const tcpServer = TcpServer(tcpPort, queueManager);
  const webSocketServer = WebSocketServer(wsPort, queueManager);

  tcpServer.on('salt-status', (status) => {
    debug(status);
  });

  [tcpServer, webSocketServer].forEach(server => server.start());

  distributeData(queueManager, webSocketServer.server, serialize);
  distributeDataToSalt(queueManager, tcpServer);
}

module.exports = Server
