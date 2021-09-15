
const test = require('tape')
const Struct = require('awestruct')
test('test Init', (assert) => {
  // assert.equals('aaa', 'aaa');
  // assert.strictEqual(obj.simulationId, data.simulationId)

  const Packet = Struct([
    ['len', Struct.types.int8],
    ['age', Struct.types.uint32]
  ])

  const buffer = Buffer.from([3, 1, 0, 0, 0])

  // Packet.size()

  try {
    const obj = Packet(buffer)
    console.log(obj)
  } catch (err) {
    console.log(err.message)
  }
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
