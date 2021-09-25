
const fse = require('fs-extra')
const fs = require('fs')
const csv = require('csv-parser')

async function read (simulationId, type) {
  let file
  if (type === 'ft') {
    file = `/home/ubuntu/uniq-sim/output/${simulationId}/ft/ft_phase_reward_output.txt`
  } else {
    file = `/home/ubuntu/uniq-sim/output/${simulationId}/ft/rl_phase_reward_output.txt`
  }

  await fse.access(file, fs.F_OK)

  return csvToObj(file)
}

async function csvToObj (file) {
  const map = Object.create({})
  return new Promise((resolve, reject) => {
    try {
      fse.createReadStream(file)
        .pipe(csv())
        .on('data', (row) => {
          const target = map[row.tl_name] || []
          target.push({
            phase: row.phase,
            reward: row.reward
          })
          map[row.tl_name] = target
        })
        .on('end', () => {
          resolve(map)
        })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = read
