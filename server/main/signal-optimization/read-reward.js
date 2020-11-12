
const fs = require('fs-extra')
const csv = require('neat-csv')

async function read(simulationId) {
  const file = `/home/ubuntu/uniq-sim/output/${simulationId}/output-reward.csv`

  const str = await fs.readFile(file, 'utf-8')
  const array = await csv(str)
  const result = array.map(v => Object.values(v))
  return result.reduce((acc, cur) => {
    acc[0].push(cur[0])
    acc[1].push(cur[1])
    return acc
  }, [[],[]])
}

module.exports = read
