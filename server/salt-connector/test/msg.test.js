
const test = require('tape')
const { Header, Init, Data } = require('../salt-msg')

const encode = require('../encode-struct')
const decode = require('../decode-struct')
test('test Init', (assert) => {
  const base = Init(Buffer.alloc(1024))
  const obj = Object.assign(base, {
    header: {
      type: 1,
      timestamp: 1
    },
    simulationId: 'SALT-20200801-0000000001'
  })
  // const data = Init(Init.encode(obj))

  const x = encode(Init, {
    simulationId: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  })

  decode(x)

  // assert.equals('aaa', 'aaa');

  // assert.strictEqual(obj.simulationId, data.simulationId)
  assert.end()
})

// test('test Header', (assert) => {
//   const base = Header(Buffer.alloc(1024))
//   const obj = Object.assign(base, {
//     type: 1,
//     timestamp: 1
//   })
//   const data = Header(Header.encode(obj))

//   assert.equals(obj.type, data.type)
//   assert.equals(obj.timestamp, data.timestamp)
//   assert.end()
// })
// test('test DataMsg', (t) => {
//   const base = Data(Buffer.alloc(1024))

//   const obj = Object.assign(base, {
//     header: {
//       type: 1,
//       timestamp: 1
//     },
//     numRoads: 1,
//     roads: [
//       {
//         lenRoadId: 14,
//         roadId: '-572700451_1_0',
//         speed: 32,
//         numVehicles: 1,
//         vehicles: [
//           1
//         ],
//         currentSignal: 'r'
//       }
//     ]

//   })

//   const dataBuffer = Data.encode(obj)
//   const dataObj = Data(dataBuffer)
//   t.equals(obj.type, dataObj.type)
//   t.equals(obj.roadLength, dataObj.roadLength)
//   t.end()
// })
