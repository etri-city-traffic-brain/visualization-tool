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
    console.log('find sId', simulationId)
    if (socket) {
      console.log('find socket')
      socket.write(buffer);
    }
  };

  const handleSaltInit = (socket, buffer) => {
    const initMsg = Init(buffer);
    const simulationId = initMsg.simulationId;
    socketToSimulationId[socket] = simulationId;
    simulationIdToSocket[simulationId] = socket;
    debug(`[INIT] ${simulationId}, ${buffer.length}`);

    const setBuffer = msgFactory.makeSet({
      // extent: [127.12111, 37.544715, 127.122871, 37.533623],
      extent: [127.10954, 37.57036,127.1576, 37.52477],
      roadType: 1,
    });

    // just for test
     send(simulationId, setBuffer)
     debug('send Set')

    //  setTimeout(() => {
    //   const setBuffer = msgFactory.makeSet({
    //     extent: [127.10954, 37.57036,127.1526, 37.52377],
    //     roadType: 0,
    //   });

    //    send(simulationId, setBuffer)
    //    debug('send Set')
    //  }, 10000)
  };

  const handleSaltData = (socket, buffer) => {
    const data = Data(buffer);
    const simulationId = socketToSimulationId[socket];
    debug(`[DATA] ${simulationId}, ${buffer.length}`);
    // debug(data)
    eventBus.emit('salt:data', {
      simulationId,
      ...data
    });
  };

  const handleSaltStatus = (socket, buffer) => {
    const status = Status(buffer);
    const simulationId = socketToSimulationId[socket];
    debug(chalk.yellow(JSON.stringify(status)));
    eventBus.emit('salt:status', {
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
