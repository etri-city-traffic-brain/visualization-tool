// @ts-check
const debug = require('debug')('salt-connector:ws-server');
const WebSocket = require('ws');
const chalk = require('chalk');

const { MsgType } = require('./type');

const { log } = console;

/**
 *
 * @param {{addQueue: function, deleteQueue: function, getQueue: function}} queueManager
 * @param {Object} httpServer
 */
module.exports = (httpServer, queueManager) => {
  // const server = new WebSocket.Server({ port });
  const webSocketServer = new WebSocket.Server({server: httpServer});

  function handleConnection(client) {
    client.on('message', (message) => {
      try {
        const obj = JSON.parse(message);
        if (obj.type === MsgType.INIT) { // init from ws
          Object.assign(client, { $simulationId: obj.simulationId });
          // const sId = obj.simulationId.substring(0, 16);
          debug('add queue for', obj.simulationId);
          queueManager.addQueue(obj.simulationId);
        } else if (obj.type === MsgType.SET) {
          const queue = queueManager.getQueue(obj.simulationId);
          debug(obj)
          queue.commandQueue.push(obj);
        }
      } catch (err) {
        debug(err.message);
      }
    });

    client.on('close', () => {
      log(chalk.red('disconnected'), client.id, client.$simulationId);
      log('delete queue for', client.$simulationId);
      queueManager.deleteQueue(client.$simulationId);
    });

    client.on('error', () => {
    });
  }

  webSocketServer.on('connection', handleConnection);


  return webSocketServer

};
