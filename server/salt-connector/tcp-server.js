const net = require('net');
const chalk = require('chalk');
const {
  Header, Init, Data, Status, MsgType,
} = require('./msg');

const msgFactory = require('./msg-factory');

const { log } = console;

function SaltMsgHandler(queueRegistry) {

}

function Server({ port }, queueRegistry) {
  const socketToSimulationId = {};
  const simulationIdToSocket = {};

  const send = (simulationId, buffer) => {
    const socket = simulationIdToSocket[simulationId];
    if (socket) {
      socket.write(buffer);
    }
  };

  const processInit = (socket, buffer) => {
    const obj = Init(buffer);
    socketToSimulationId[socket] = obj.simulationId;
    simulationIdToSocket[obj.simulationId] = socket;
    log(obj);

    const setMsg = msgFactory.makeSet({
      extent: [0, 0, 100, 100],
      roadType: 0,
    });
    send(obj.simulationId, setMsg);
  };

  const processData = (socket, buffer) => {
    const data = Data(buffer);
    const simulationId = socketToSimulationId[socket];
    log('[data]', simulationId);

    const queue = queueRegistry[simulationId];
    if (queue) {
      queue.dataQueue.push(data);
    }
  };

  const processStatus = (socket, buffer) => {
    const status = Status(buffer);
    log(chalk.yellow('status'));
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
      log(chalk.red('cannot find handler'));
    }
  };

  const handleClose = socket => () => {
    const sId = socketToSimulationId[socket];
    delete simulationIdToSocket[sId];
    delete socketToSimulationId[socket];

    log(socketToSimulationId);
    log(simulationIdToSocket);
  };

  const handleError = socket => () => {
    log(chalk.green(`[socket-error] ${socket.remoteAddress}:${socket.remotePort}`));
  };

  const server = net.createServer((socket) => {
    socket.on('data', handleData(socket));
    socket.on('close', handleClose(socket));
    socket.on('error', handleError(socket));
  });

  server.on('connection', (socket) => {
    log(chalk.green(`[connection] ${socket.remoteAddress}:${socket.remotePort}`));
  });

  server.on('error', (socket) => {
    log(chalk.green(`[error] ${socket.remoteAddress}:${socket.remotePort}`));
  });

  return {
    start() {
      server.listen(port, '127.0.0.1');
      log(`SALT-Connector start on ${chalk.blue(port)}...`);
    },
    write: send,
  };
}

module.exports = Server;
