const debug = require('debug')('api:record')

const connectDB = require('../dbms')
const { db } = require('../../config')

const { log } = console

connectDB(db)

const {
  useSimulationDB, dropSimulationCollection
} = require('../dbms/mongo-utils')

async function insert(collectionName, cells) {
  try {
    await dropSimulationCollection(collectionName)
  } catch (err) {
    console.log(err)
    debug(err.message)
  }

  const db = useSimulationDB()

  const collection = db.collection(collectionName)
  await collection.createIndex({ cellId: 1 })
  debug('🥵 start bulk insert')
  let bulkOperation = collection.initializeOrderedBulkOp()
  const cellIds = Object.keys(cells)
  for (let i = 0; i < cellIds.length; i += 1) {
    bulkOperation.insert(cells[cellIds[i]])
    if (i % 2000 === 0) {
      // debug('execute bulk ', i)
      await bulkOperation.execute()
      bulkOperation = collection.initializeOrderedBulkOp()
    }
  }
  await bulkOperation.execute()
  debug('🤪 finish bulk insert')
}

module.exports = insert

process.on('message', async function (message) {
  log(`[child] start bulk insert: ${message.collectionName}`)
  setTimeout(async () => {
    try {
      await insert(message.collectionName, message.cells)
      process.send({ success: true })
    } catch (err) {
      console.log(err.message)
      process.send({
        success: false,
        message: err.message
      })
    }
  }, 1000)

})
