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
  log('send buffer', buffer.length);
  socket.write(buffer);
};

socket.on('connect', () => {
  const init = msgFactory.makeInit({
    simulationId,
  });

  const status = msgFactory.makeStatus({
    status: 0,
    progress: 20,
  });

  const data = msgFactory.makeData({
    numRoads: 1,
    roads: [
      {
        roadId: '-572700451_1_0XX', // -572700451_1_0
        speed: 32,
        numVehicles: 2,
        vehicles: [1, 0],
        currentSignal: 'r',
      },
    ],
  });

  send(init);
  send(data);
  send(status);
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
