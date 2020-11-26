
const fs = require('fs-extra')
const csv = require('neat-csv')

async function read(simulationId, type) {
  const postfix = type === 'fixed' ? 'ft' : 'rl'
  const file = `/home/ubuntu/uniq-sim/output/${simulationId}/output-phase-${postfix}.csv`

  const str = await fs.readFile(file, 'utf-8')
  const array = await csv(str)
  const result = array.map(v => Object.values(v))
  return result.reduce((acc, cur) => {
    acc[0].push(cur[0])
    acc[1].push(cur[1])
    acc[2].push(cur[2])
    acc[3].push(cur[3])
    acc[4].push(cur[4])
    acc[5].push(cur[5])

    return acc
  }, [[],[],[],[],[],[]])
}

module.exports = read
