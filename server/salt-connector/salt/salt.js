const net = require('net');
const chalk = require('chalk');
const msgFactory = require('../msg-factory');
const { Header, Set } = require('../msg');

const roads = require('./salt-roads');

const { log } = console;

const socket = net.connect({ port: 1337, host: '1.245.47.108' });
const HEADER_LENGTH = 16;

// const simulationId = '001'.padStart(24, '0');
const simulationId = 'SALT_202009_00940';

log('*** SALT Simulator Dummy ***');
log('simulationId:', simulationId);

const send = (buffer) => {
  log('send buffer', buffer.length - 16);
  socket.write(buffer);
};

const vehicles = Array(48).fill(0)

const str2CharCodes = str => str.split('').map(d => d.charCodeAt())

socket.on('connect', () => {
  const init = msgFactory.makeInit({
    simulationId: str2CharCodes(simulationId),
  });

  const status = msgFactory.makeStatus({
    status: 0,
    progress: 20,
  });

  const data = msgFactory.makeData({
    numRoads: 3,
    roads: [
      {
        roadId: str2CharCodes('-572700451_0_0  '), // -572700451_1_0
        speed: 36,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes('-572700451_0_1  '), // -572700451_1_0
        speed: 36,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes('-572700451_0_2  '), // -572700451_1_0
        speed: 36,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
    ],
  });

  send(init);
  send(data);
  // send(status);
});

socket.on('data', (buffer) => {
  const header = Header(buffer);
  log(chalk.green('*** Command received ***'));
  log(header);
  const bodyLength = header.length + HEADER_LENGTH;
  const bodyBuffer = buffer.slice(HEADER_LENGTH, bodyLength);

  if (header.type === 10) {
    const set = Set(bodyBuffer)
    log(set)
  }
});

socket.on('close', () => {
  log('close');
});

socket.on('error', (err) => {
  log('on error: ', err.code);
});

// setTimeout(() => socket.destroy(), 5000);
