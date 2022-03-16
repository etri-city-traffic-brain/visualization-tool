const debug = require('debug')('api:record')

const {
  useSimulationDB, dropSimulationCollection
} = require('../dbms/mongo-utils')

module.exports = async (collectionName, cells) => {
  try {
    await dropSimulationCollection(collectionName)
  } catch (err) {
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
    if (i % 1000 === 0) {
      await bulkOperation.execute()
      bulkOperation = collection.initializeOrderedBulkOp()
    }
  }
  await bulkOperation.execute()
  debug('🤪 finish bulk insert')
}
