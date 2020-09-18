const chalk = require('chalk');
const WebSocketServer = require('./ws-server');
const TcpServer = require('./tcp-server');

const config = require('../config');

const { tcpPort, wsPort } = config.server;

const { log } = console;

function Server({ tcpPort, wsPort }) {
  log(chalk.yellow('SALT connector module starting...'));
  const queueRegistry = {
    ['001'.padStart(24, '0')]: {
      dataQueue: [],
      commandQueue: [],
    },
    ['002'.padStart(24, '0')]: {
      dataQueue: [],
      commandQueue: [],
    },
  };
  const tcpServer = TcpServer({ port: tcpPort }, queueRegistry);
  tcpServer.start();
  const wsServer = WebSocketServer({ port: wsPort }, queueRegistry);
  wsServer.start();
}

Server({
  tcpPort,
  wsPort,
});
