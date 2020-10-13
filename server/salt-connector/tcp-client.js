const net = require('net');
const chalk = require('chalk');
const msgFactory = require('./msg-factory');
const { Header } = require('./msg');

const { log } = console;
const socket = net.connect({
  port: 1337,
  host: 'localhost',
});

// const simulationId = '001'.padStart(24, '0');
const simulationId = 'SALT_202007_00516';

socket.on('connect', () => {
  const init = msgFactory.makeInit({
    simulationId,
  });

  const data = msgFactory.makeData({
    numRoads: 1,
    roads: [
      {
        lenRoadId: 14,
        roadId: '-572700451_1_0', // -572700451_1_0
        speed: 32,
        numVehicles: 3,
        vehicles: [
          1, 0, 1,
        ],
        currentSignal: 'r',
      },
    ],
  });

  socket.write(init);
  socket.write(data);
  // setTimeout(() => {
  //   socket.write(data);
  // }, 1000);
});

socket.on('data', (buffer) => {
  const header = Header(buffer);
  log(chalk.green('*** command received ***'));
  log(header);
});

socket.on('close', () => {
  log('close');
});

socket.on('error', (err) => {
  log('on error: ', err.code);
});
