const debug = require('debug')('salt-connector:server');
const chalk = require('chalk');

const WebSocketServer = require('./ws-server');
const TcpServer = require('./tcp-server');

const { tcpPort, wsPort } = require('../config').server;

const serialize = obj => JSON.stringify(obj);

const {
  distributeData,
  distributeDataToSalt,
} = require('./msg-distributor');

function Server({ tcpPort, wsPort }) {
  debug(chalk.yellow('server start'));
  const queueRegistry = Object.create(null);
  const queueManager = {
    addQueue(simulationId) {
      queueRegistry[simulationId] = {
        dataQueue: [],
        commandQueue: [],
      };
    },
    deleteQueue(simulationId) {
      delete queueRegistry[simulationId];
    },
    getQueue(simulationId) {
      return queueRegistry[simulationId];
    },
    getQueueIds() {
      return Object.keys(queueRegistry);
    },
  };

  const tcpServer = TcpServer({ port: tcpPort }, queueManager);
  const webSocketServer = WebSocketServer({ port: wsPort }, queueManager);

  [tcpServer, webSocketServer].forEach(server => server.start());

  distributeData(queueManager, webSocketServer.server, serialize);
  distributeDataToSalt(queueManager, tcpServer);
}

Server({
  tcpPort,
  wsPort,
});
