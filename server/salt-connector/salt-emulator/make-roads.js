const msgFactory = require('../salt-msg-factory');
const { MAX_ROAD_ID_LENGTH } = require('../salt-msg');

const vehicles = Array(48).fill(0).map(() => Math.floor(Math.random() * 2))



const str2CharCodes = str => {
  return str.split('').map(d => d.charCodeAt())
}


const randomSpeed = () => Math.floor(Math.random() * 70)

const randomCars = () => Math.floor(Math.random() * 4)

const roadId = str => str.padEnd(MAX_ROAD_ID_LENGTH, ' ')

const makeData = () => {
  const data = msgFactory.makeData({
    numRoads: 7,
    roads: [
      {
        roadId: str2CharCodes('-563104349_8_0  '), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes('563104839_7_0   '), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes('563109038_0_0   '), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563104376_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: randomCars(),
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563107729_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563104341_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
      {
        roadId: str2CharCodes(roadId('-563104338_0_0')), // -572700451_1_0
        speed: randomSpeed(),
        currentSignal: 1,
        numVehicles: 4,
        vehicles: vehicles,
      },
    ],
  });
  return data
}

module.exports = makeData
