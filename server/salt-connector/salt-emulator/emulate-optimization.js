
//    SALT SIMULATION EMULATOR
//    SEND DATA MESSAGE TO VIS-SERVER

const net = require('net')
const chalk = require('chalk')
const msgFactory = require('../salt-msg-factory')
const { Header, Set, MAX_ROAD_ID_LENGTH, MAX_SIMULATION_ID_LENGTH } = require('../salt-msg')

const roads = require('./salt-roads')

const { log } = console

const roadId = str => str.padEnd(MAX_ROAD_ID_LENGTH, ' ')
const sId = str => str.padEnd(MAX_SIMULATION_ID_LENGTH, ' ')

// const socket = net.connect({ port: 1337, host: '1.245.47.108' })
const socket = net.connect({ port: 1337, host: '192.168.1.220' })
const HEADER_LENGTH = 16

// const simulationId = '001'.padStart(24, '0');
const simulationId = sId(process.argv[2] || 'SALT_202009_00940')
// const simulationId = 'SALT_202009_00670';

log('*** SALT Simulator Dummy ***')
log('simulationId:', simulationId)

const send = (buffer) => {
  // log('send buffer', buffer.length - 16);
  socket.write(buffer)
}

const vehicles = Array(48).fill(0).map(() => Math.floor(Math.random() * 2))

const str2CharCodes = str => {
  return str.split('').map(d => d.charCodeAt())
}

const sleep = sec => new Promise((resolve) => setTimeout(() => resolve(), sec))

const randomSpeed = () => Math.floor(Math.random() * 70)

// const randomCars = () => Math.floor(Math.random() * 4)
const randomCars = () => 4
const makeData = () => {
  const data = msgFactory.makeData({
    numRoads: 7,
    roads: [
      {
        roadId: str2CharCodes('-563104349_8_0  '), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles
      },
      {
        roadId: str2CharCodes('563104839_7_0   '), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles
      },
      {
        roadId: str2CharCodes('563109038_0_0   '), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles
      },
      {
        roadId: str2CharCodes(roadId('-563104376_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles
      },
      {
        roadId: str2CharCodes(roadId('-563107729_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles
      },
      {
        roadId: str2CharCodes(roadId('-563104341_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles
      },
      {
        roadId: str2CharCodes(roadId('-563104338_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles
      }
    ]
  })
  return data
}

socket.on('connect', async () => {
  const init = msgFactory.makeInit({
    simulationId: str2CharCodes(simulationId)
  })

  const status = msgFactory.makeStatus({ status: 0, progress: 20 })

  send(init)
  // send(data);
  // send(msgFactory.makeStatus({ status: 0, progress: 20 }))
  // log('send status')
  // await sleep(1000)

  for (let j = 0; j < 3; j++) { // epoch
    for (let i = 0; i <= 100; i += 20) { // simulation
      await sleep(500)
      send(makeData())
      // send(msgFactory.makeStatus({ status: 1, progress: i * 20 }))
      send(msgFactory.makeStatus({ status: 1, progress: i }))
    }
    await sleep(1000)
  }

  // log('send status')
  // send(msgFactory.makeStatus({ status: 0, progress: 55 }))
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
})

socket.on('data', (buffer) => {
  const header = Header(buffer)
  // log(chalk.green('*** Command received ***'))
  // log(header)
  const bodyLength = header.length + HEADER_LENGTH
  const bodyBuffer = buffer.slice(HEADER_LENGTH, bodyLength)

  if (header.type === 10) {
    const set = Set(bodyBuffer)
    log(set)
  } else if (header.type === 11) {
    log('*** STOP REQUEST ***')
  }
})

socket.on('close', () => {
  log('close')
})

socket.on('error', (err) => {
  log('on error: ', err.code)
})
