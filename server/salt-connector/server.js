const debug = require('debug')('salt-connector:connector');
const chalk = require('chalk');

const startWebSocketServer = require('./ws-server');
const startSlatMessageReceiver = require('./tcp-server');
const QueueManager = require('./queue-manager');
const { tcpPort, wsPort } = require('../config').server;
const config = require('../config');
const serialize = obj => JSON.stringify(obj);

const {
  distributeData,
  distributeDataToSalt,
} = require('./msg-distributor');
const SaltMsgHandler = require('./salt-msg-handler');
const BufferManager = require('./socket-buffer-manager');
/**
 * SALT connector server
 * connect simulator and web browser
 *
 * @param {Object} param
 * @param {number} param.tcpPort
 */

module.exports = (httpServer, tcpPort) => {
  debug(chalk.yellow('Messenger service start'));
  const queueManager = QueueManager();
  const tcpServer = startSlatMessageReceiver(
    tcpPort,
    SaltMsgHandler(queueManager),
    BufferManager()
  );
  const webSocketServer = startWebSocketServer(httpServer, queueManager);

  tcpServer.on('salt-status', (status) => {
    debug(status);
  });

  distributeData(queueManager, webSocketServer, serialize);
  distributeDataToSalt(queueManager, tcpServer);
}
