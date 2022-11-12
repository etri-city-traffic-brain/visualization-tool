const { getSimulations, currentTimeFormatted } = require('../../../globals')

module.exports = async function createSimulation (param) {
  console.log('add simulation')
  await getSimulations()
    .push({
      ...param,
      status: 'preparing',
      created: currentTimeFormatted(),
      epoch: 0
    })
    .write()
}
