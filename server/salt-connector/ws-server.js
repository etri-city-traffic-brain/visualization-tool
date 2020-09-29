const debug = require('debug')('salt-connector:ws-server');
const WebSocket = require('ws');
const chalk = require('chalk');

const { MsgType } = require('./msg');

const { log } = console;
const serialize = obj => JSON.stringify(obj);

function Server({ port }, queueManager) {
  const server = new WebSocket.Server({ port });

  function handleConnection(client) {
    client.on('message', (message) => {
      try {
        const obj = JSON.parse(message);
        if (obj.type === MsgType.INIT) { // init
          Object.assign(client, { $simulationId: obj.simulationId });
          log('add queue for', obj.simulationId);
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

    // demo
    const dummy = () => {
      client.send(serialize({
        header: {
          type: 1,
          timestamp: new Date().getTime(),
        },
        roads: [],
      }));
    };
    // setInterval(dummy, 1000);

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
