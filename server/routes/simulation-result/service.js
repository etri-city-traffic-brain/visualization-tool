
const mongoose = require('mongoose')
const model = require('./model')
const useDb = name => mongoose.connection.useDb(name)

async function getValueByLinkOrCell (simulationId, linkOrCellId) {
  console.log('service', simulationId, linkOrCellId)

  const collection = useDb('simulation_results').collection(simulationId)

  const searchOption = linkOrCellId.indexOf('_') >= 0 ? { cellId: linkOrCellId } : { linkId: linkOrCellId }
  const x = await collection.findOne(searchOption)
  return x
}

module.exports = {
  getValueByLinkOrCell
}
