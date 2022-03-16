
const fse = require('fs-extra')
const fs = require('fs')
const csv = require('csv-parser')

async function read (simulationId, type) {
  let file
  if (type === 'ft') {
    file = `/home/ubuntu/uniq-sim/data/${simulationId}/output/ft/ft_phase_reward_output.txt`
  } else {
    file = `/home/ubuntu/uniq-sim/data/${simulationId}/output/test/rl_phase_reward_output.txt`
  }

  await fse.access(file, fs.F_OK)

  const r = await csvToObj(file)
  return r
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
            reward: row.reward,
            step: row.step
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
