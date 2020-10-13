const debug = require('debug')('salt-connector:msg-distributor');
const WebSocket = require('ws');
const msgFactory = require('./msg-factory');

/**
 * 큐내의 데이터를 웹소켓 클라이언트로 전송
 * @param {}} queueRegistry
 * @param {*} wss
 */
function distributeData({ getQueue, getQueueIds }, wss, serialize) {
  debug('[--> Web Browser] started...');
  const distribute = () => {
    getQueueIds().forEach((simulationId) => {
      const queue = getQueue(simulationId);
      if (queue) {
        const data = queue.dataQueue.splice(0, 10);
        if (data.length > 0) {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              if (client.$simulationId === simulationId) {
                client.send(serialize(data[0]));
                debug('send to browser', client.$simulationId);
              }
            }
          });
        }
      }
    });
    setTimeout(distribute, 1000);
  };

  distribute();
}

/**
 * 큐내의 데이터를 SALT 시뮬레이터로 전송
 * @param {}} queueRegistry
 * @param {*} wss
 */
function distributeDataToSalt({ getQueue, getQueueIds }, tcpServer) {
  debug('[--> SALT] started...');
  const distribute = () => {
    getQueueIds().forEach((simulationId) => {
      const queue = getQueue(simulationId);
      if (queue) {
        const data = queue.commandQueue.splice(0, 10);
        if (data.length > 0) {
          debug('distirbutor: set message');
          const setMsg = msgFactory.makeSet({
            extent: [0, 0, 100, 100],
            roadType: 0,
          });

          tcpServer.send(simulationId, setMsg);
        }
      }
    });
    setTimeout(distribute, 1000);
  };

  distribute();
}

module.exports = {
  distributeData,
  distributeDataToSalt,
};
