

//    SALT SIMULATION EMULATOR
//    SEND DATA MESSAGE TO VIS-SERVER

const net = require('net');
const chalk = require('chalk');

const msgFactory = require('../salt-msg-factory');
const { Header, Set, MAX_SIMULATION_ID_LENGTH} = require('../salt-msg');

const makeLoadData = require('./make-roads')

const sId = str => str.padEnd(MAX_SIMULATION_ID_LENGTH, ' ')

const simulationId = sId(process.argv[2] || 'SALT_202009_00940');
const HEADER_LENGTH = 16;

const socket = net.connect({ port: 1337, host: '1.245.47.108' });

const send = (buffer) => {
  socket.write(buffer);
};

const sleep = sec => new Promise((resolve) => setTimeout(() => resolve(), sec))
const str2CharCodes = str => str.split('').map(char => char.charCodeAt())

const { log } = console;

socket.on('connect', async () => {

  // SEND INIT
  send(msgFactory.makeInit({
    simulationId: str2CharCodes(simulationId),
  }));

  // SEND DATA
  for(let i = 1; i < 10; i++) {
    send(makeLoadData());
    send(msgFactory.makeStatus({ status: 1, progress: i * 10 }))
    await sleep(500)
  }

});

socket.on('data', (buffer) => {
  const header = Header(buffer);
  log(header);
  const bodyLength = header.length + HEADER_LENGTH;
  const bodyBuffer = buffer.slice(HEADER_LENGTH, bodyLength);

  switch (header.type) {
    case 10:
      const set = Set(bodyBuffer)
      break;
    case 11:
    default:
  }
});

socket.on('close', () => {
  log('close');
});

socket.on('error', (err) => {
  log('on error: ', err.code);
});
