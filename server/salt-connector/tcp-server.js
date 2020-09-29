const debug = require('debug')('salt-connector:tcp-server');
const net = require('net');
const chalk = require('chalk');
const {
  Header, Init, Data, Status, MsgType,
} = require('./msg');

function Server({ port }, { getQueue }) {
  const socketToSimulationId = {};
  const simulationIdToSocket = {};

  const send = (simulationId, buffer) => {
    const socket = simulationIdToSocket[simulationId];
    if (socket) {
      socket.write(buffer);
    }
  };

  const processInit = (socket, buffer) => {
    const initMsg = Init(buffer);
    const { simulationId } = initMsg;
    socketToSimulationId[socket] = simulationId;
    simulationIdToSocket[simulationId] = socket;
    debug('SALT INIT');
    const queue = getQueue(simulationId);
    if (queue) {
      queue.socket = socket;
    }
    debug('myQueue: ', queue);
  };

  const processData = (socket, buffer) => {
    const data = Data(buffer);
    // debug(data);
    const simulationId = socketToSimulationId[socket];
    debug('SALT DATA', simulationId);

    const queue = getQueue(simulationId);
    if (queue) {
      queue.dataQueue.push(data);
    }
  };

  const processStatus = (socket, buffer) => {
    const status = Status(buffer);
    debug(chalk.yellow('status'));
  };

  const handlers = {
    [MsgType.INIT]: processInit,
    [MsgType.DATA]: processData,
    [MsgType.STATUS]: processStatus,
  };

  const handleData = socket => (buffer) => {
    const header = Header(buffer);
    const handler = handlers[header.type];
    if (handler) {
      handler(socket, buffer);
    } else {
      debug(chalk.red('cannot find handler'));
    }
  };

  const handleClose = socket => () => {
    debug('handleClose');
    const simulationId = socketToSimulationId[socket];
    delete simulationIdToSocket[simulationId];
    delete socketToSimulationId[socket];
  };

  const handleError = socket => () => {
    debug(chalk.green(`[socket-error] ${socket.remoteAddress}:${socket.remotePort}`));
  };

  const server = net.createServer((socket) => {
    socket.on('data', handleData(socket));
    socket.on('close', handleClose(socket));
    socket.on('error', handleError(socket));
  });

  server.on('connection', (socket) => {
    debug(chalk.green(`[connection] ${socket.remoteAddress}:${socket.remotePort}`));
  });

  server.on('error', (socket) => {
    debug(chalk.green(`[error] ${socket.remoteAddress}:${socket.remotePort}`));
  });

  return {
    start() {
      server.listen(port, '127.0.0.1');
      debug(`SALT-Connector start on ${chalk.blue(port)}...`);
    },
    send,
  };
}

module.exports = Server;
