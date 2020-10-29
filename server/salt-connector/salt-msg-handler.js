const debug = require('debug')('salt-connector:msg-handler');
const chalk = require('chalk');

const events = require('events');

// const charCodes2Str = codes => codes.map(d => String.fromCharCode(d)).join('')
const msgFactory = require('./msg-factory');
const { EventEmitter } = events;

const {
  Init, Data, Status
} = require('./msg');

const { MsgType } = require('./type');

/**
 *
 * @param {function} getQueue queue manager's function
 */
function SaltMsgHandler() {
  const socketToSimulationId = {};
  const simulationIdToSocket = {};
  const eventBus = Object.create(EventEmitter.prototype);

  const send = (simulationId, buffer) => {
    const socket = simulationIdToSocket[simulationId];
    if (socket) {
      socket.write(buffer);
    }
  };

  //   INIT
  const handleSaltInit = (socket, buffer) => {
    const initMsg = Init(buffer);
    const simulationId = initMsg.simulationId;
    socketToSimulationId[socket] = simulationId;
    simulationIdToSocket[simulationId] = socket;
    debug(`[INIT] ${simulationId}, ${buffer.length}`);

    const setBuffer = msgFactory.makeSet({
      extent: [127.33342, 36.3517, 127.34806, 36.34478], // max.y 가 min.y 보다 작아야 함
      roadType: 1,
    });

    // just for test
     send(simulationId, setBuffer)
     debug('send Set')
  };

  //  DATA
  const handleSaltData = (socket, buffer) => {
    const data = Data(buffer);
    const simulationId = socketToSimulationId[socket];
    debug(`[DATA] ${simulationId}, ROADS: ${data.roads.length} ${buffer.length}`);
    // debug(data)
    eventBus.emit('salt:data', {
      event: 'salt:data',
      simulationId,
      ...data
    });
  };


  //  STATUS
  const handleSaltStatus = (socket, buffer) => {
    const status = Status(buffer);
    const simulationId = socketToSimulationId[socket];
    debug(chalk.yellow(JSON.stringify(status)));
    eventBus.emit('salt:status', {
      event: 'salt:status',
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

  return Object.assign(eventBus, {
    get(type) { return handlers[type]; },
    clearResource,
    send,
  });
}

module.exports = SaltMsgHandler;
