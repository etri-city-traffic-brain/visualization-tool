const debug = require('debug')('salt-connector:msg-handler');

const msgFactory = require('./salt-msg-factory');
const { EventEmitter } = require('events');

const { Init, Data, Status } = require('./salt-msg');
const { INIT, DATA, STATUS } = require('./salt-msg-type').MsgType;
const { EVENT_DATA, EVENT_STATUS } = require('./event-types');

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
    socketToSimulationId[socket.remotePort] = simulationId;
    simulationIdToSocket[simulationId] = socket;
    debug(`[INIT] ${simulationId}, ${socket.remotePort}`);

    const setBuffer = msgFactory.makeSet({
      // extent: [127.33342, 36.3517, 127.34806, 36.34478], // max.y 가 min.y 보다 작아야 함
      extent: [127.3373, 36.34837, 127.34303, 36.34303 - 0.0005], // max.y 가 min.y 보다 작아야 함
      roadType: 1,
    });

    send(simulationId, setBuffer)
  };

  //  DATA
  const handleSaltData = (socket, buffer) => {
    const data = Data(buffer);
    const simulationId = socketToSimulationId[socket.remotePort];
    eventBus.emit(EVENT_DATA, {
      event: EVENT_DATA,
      simulationId,
      ...data
    });
  };


  //  STATUS
  const handleSaltStatus = (socket, buffer) => {
    const status = Status(buffer);
    const simulationId = socketToSimulationId[socket.remotePort];
    eventBus.emit(EVENT_STATUS, {
      event: EVENT_STATUS,
      simulationId,
      ...status
    });
  };

  const handlers = {
    [INIT]: handleSaltInit,
    [DATA]: handleSaltData,
    [STATUS]: handleSaltStatus,
  };

  const clearResource = (socket) => {
    delete simulationIdToSocket[socketToSimulationId[socket.remotePort]];
    delete socketToSimulationId[socket.remotePort];
  };

  return Object.assign(eventBus, {
    get(type) { return handlers[type]; },
    clearResource,
    send,
  });
}

module.exports = SaltMsgHandler;
