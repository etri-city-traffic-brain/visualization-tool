// @ts-check
const debug = require('debug')('salt-connector:ws-server');
const WebSocket = require('ws');
const chalk = require('chalk');

const { MsgType } = require('./type');

const { log } = console;

/**
 *
 * @param {number} port
 * @param {{addQueue: function, deleteQueue: function, getQueue: function}} queueManager
 */
function Server(port, queueManager) {
  const server = new WebSocket.Server({ port });

  function handleConnection(client) {
    client.on('message', (message) => {
      try {
        const obj = JSON.parse(message);
        if (obj.type === MsgType.INIT) { // init
          Object.assign(client, { $simulationId: obj.simulationId });
          // const sId = obj.simulationId.substring(0, 16);
          debug('add queue for', obj.simulationId);
          queueManager.addQueue(obj.simulationId);
        } else if (obj.type === MsgType.SET) {
          const queue = queueManager.getQueue(obj.simulationId);
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

  server.on('connection', handleConnection);

  return {
    start() {
      debug(`GUI-Connector start on ${chalk.blue(port)}...`);
    },
    server,
  };
}

module.exports = Server;
