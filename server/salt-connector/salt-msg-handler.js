const debug = require('debug')('salt-connector:msg-handler');
const chalk = require('chalk');

const events = require('events');

const { EventEmitter } = events;

const {
  Init, Data, Status,
} = require('./msg');

const { MsgType } = require('./type');

/**
 *
 * @param {function} getQueue queue manager's function
 */
function SaltMsgHandler({ getQueue }) {
  const socketToSimulationId = {};
  const simulationIdToSocket = {};
  const e = Object.create(EventEmitter.prototype);

  const send = (simulationId, buffer) => {
    const socket = simulationIdToSocket[simulationId];
    if (socket) {
      socket.write(buffer);
    }
  };

  const handleSaltInit = (socket, buffer) => {
    const initMsg = Init(buffer);
    const { simulationId } = initMsg;
    socketToSimulationId[socket] = simulationId;
    simulationIdToSocket[simulationId] = socket;
    debug(`[INIT] ${simulationId}, ${buffer.length}`);
    const queue = getQueue(simulationId);
    if (queue) {
      queue.socket = socket;
    }
  };

  const handleSaltData = (socket, buffer) => {
    const data = Data(buffer);
    const simulationId = socketToSimulationId[socket];
    debug(`[DATA] ${simulationId}, ${buffer.length}`);
    const queue = getQueue(simulationId);
    if (queue) {
      queue.dataQueue.push(data);
      debug(`find queue for ${simulationId}`);
    } else {
      debug(`cannot find queue for ${simulationId}`);
    }
  };

  const handleSaltStatus = (socket, buffer) => {
    const status = Status(buffer);
    const simulationId = socketToSimulationId[socket];
    debug(chalk.yellow(JSON.stringify(status)));
    e.emit('salt-status', {
      simulationId,
      ...status
    });
  };

  const handlers = {
    [MsgType.INIT]: handleSaltInit,
    [MsgType.DATA]: handleSaltData,
    [MsgType.STATUS]: handleSaltStatus,
  };

  const clearResource = (socket) => {
    delete simulationIdToSocket[socketToSimulationId[socket]];
    delete socketToSimulationId[socket];
  };

  return Object.assign(e, {
    get(type) { return handlers[type]; },
    clearResource,
    send,
  });
}

module.exports = SaltMsgHandler;
