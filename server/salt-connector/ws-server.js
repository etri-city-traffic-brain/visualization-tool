const WebSocket = require('ws');
const chalk = require('chalk');

const { log } = console;
const serialize = obj => JSON.stringify(obj);

const debug = require('debug')('salt:connector');
/**
 * 큐내의 데이터를 wss 에 연결된 클라이언트들에게 전송
 * @param {}} queueRegistry
 * @param {*} wss
 */
function distributeData(queueRegistry, wss) {
  log('Message-Distributor started...');
  const send = () => {
    Object.keys(queueRegistry).forEach((simulationid) => {
      const queue = queueRegistry[simulationid];
      const data = queue.dataQueue.splice(0, 10);
      if (data.length > 0) {
        console.log('check', data);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(serialize(data));
            log(client.$simulationId);
          }
        });
      }
    });
    setTimeout(send, 1000);
  };

  send();
}

function Server({ port }, queueRegistry) {
  const wss = new WebSocket.Server({ port });
  // const registry = Object.create(null);
  // const registry = [];

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      log('received: %s', message);

      const obj = JSON.parse(message);
      if (obj.type === 0) {
        Object.assign(ws, { $simulationId: obj.simulationId });
      }
    });

    ws.on('close', () => {
      log(chalk.red('disconnected'), ws.id);
    });

    // demo
    setInterval(() => {
      ws.send(serialize({
        header: {
          type: 1,
          timestamp: new Date().getTime(),
        },
        roads: [
          // {
          //   roadId: '-572700451_0_0',
          //   speed: 20,
          //   vehicles: [1, 1, 1],
          // },
          {
            roadId: '-572700451_0_0',
            speed: Math.floor(Math.random() * 80) + 20,
            vehicles: Array(Math.floor(Math.random() * 5)).fill(1),
          },
          {
            roadId: '-572700451_1_0',
            speed: Math.floor(Math.random() * 80) + 20,
            vehicles: Array(Math.floor(Math.random() * 5)).fill(1),
          },
          {
            roadId: '-572700451_1_1',
            speed: Math.floor(Math.random() * 80) + 20,
            vehicles: Array(Math.floor(Math.random() * 5)).fill(1),
          },
          {
            roadId: '-572700452_4_0',
            speed: Math.floor(Math.random() * 80) + 20,
            vehicles: Array(Math.floor(Math.random() * 5)).fill(1),
          },
        ],
      }));
    }, 1000);

    ws.on('error', () => {
    });
  });

  distributeData(queueRegistry, wss);

  return {
    start() {
      log(`GUI-Connector start on ${chalk.blue(port)}...`);
    },
  };
}

module.exports = Server;
