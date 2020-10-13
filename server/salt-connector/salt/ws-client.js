const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');
const { log } = console;

const serialize = obj => JSON.stringify(obj);
ws.on('open', () => {
  ws.send(serialize({
    type: 0,
    simulationId: 's1',
  }));
});

ws.on('message', (data) => {
  console.log(data);
});
