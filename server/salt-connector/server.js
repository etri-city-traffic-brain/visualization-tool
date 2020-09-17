const chalk = require('chalk');
const WebSocketServer = require('./ws-server');
const TcpServer = require('./tcp-server');

const { log } = console;

function Server() {
  log(chalk.yellow('SALT Connector Module starting...'));
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
  const tcpServer = TcpServer({ port: 1337 }, queueRegistry);
  tcpServer.start();
  const wsServer = WebSocketServer({ port: 8082 }, queueRegistry);
  wsServer.start();
}

Server();
