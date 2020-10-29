const net = require('net');
const chalk = require('chalk');
const msgFactory = require('../msg-factory');
const { Header, Set, MAX_ROAD_ID_LENGTH, MAX_SIMULATION_ID_LENGTH} = require('../msg');

const roads = require('./salt-roads');

const { log } = console;

const socket = net.connect({ port: 1337, host: '1.245.47.108' });
const HEADER_LENGTH = 16;

// const simulationId = '001'.padStart(24, '0');
// const simulationId = 'SALT_202009_00940';
const simulationId = 'SALT_202009_00670';

log('*** SALT Simulator Dummy ***');
log('simulationId:', simulationId);

const send = (buffer) => {
  // log('send buffer', buffer.length - 16);
  socket.write(buffer);
};

const vehicles = Array(48).fill(0).map(() => Math.floor(Math.random() * 2))

const str2CharCodes = str => {
  return str.split('').map(d => d.charCodeAt())
}

const sleep = sec => new Promise((resolve) => setTimeout(() => resolve(), sec))

const roadId = str => str.padEnd(MAX_ROAD_ID_LENGTH, ' ')
const sId = str => str.padEnd(MAX_SIMULATION_ID_LENGTH, ' ')
socket.on('connect', async () => {
  const init = msgFactory.makeInit({
    simulationId: str2CharCodes(simulationId),
  });

  const status = msgFactory.makeStatus({
    status: 0,
    progress: 20,
  });

  const data = msgFactory.makeData({
    numRoads: 7,
    roads: [
      {
        roadId: str2CharCodes('-563104349_8_0  '), // -572700451_1_0
        speed: 2,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes('563104839_7_0   '), // -572700451_1_0
        speed: 2,
        currentSignal: 1,
        numVehicles: 3,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes('563109038_0_0   '), // -572700451_1_0
        speed: 2,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563104376_0_0')), // -572700451_1_0
        speed: 2,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563107729_0_0')), // -572700451_1_0
        speed: 70,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563104341_0_0')), // -572700451_1_0
        speed: 70,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563104338_0_0')), // -572700451_1_0
        speed: 70,
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
    ],
  });

  console.log(data.length - 16)
  send(init);
  send(data);
  // send(data);
  send(msgFactory.makeStatus({ status: 0, progress: 20 }))
  // log('send status')
  await sleep(1000)

  // log('send status')
  send(msgFactory.makeStatus({ status: 0, progress: 50 }))
  await sleep(1000)
  send(msgFactory.makeStatus({ status: 0, progress: 55 }))
  // send(msgFactory.makeStatus({ status: 1, progress: 100 }))

  // send(status);

  // const r = msgFactory.makeRoad({
  //   roadId: str2CharCodes('-563104349_8_0  '), // -572700451_1_0
  //   speed: 36,
  //   currentSignal: 1,
  //   numVehicles: 4,
  //   vehicles: vehicles,
  // },)
  // console.log('road size:', r.length - 16)

  // setTimeout(()=>{
  //   socket.destroy()
  // }, 2000)
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
