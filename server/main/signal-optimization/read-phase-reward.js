const fse = require('fs-extra')
const fs = require('fs')
const csv = require('csv-parser')

const baseDir = '/home/ubuntu/uniq-sim/data'

async function read (simulationId, type) {
  console.log('read', simulationId, type)
  let file
  if (type === 'ft') {
    file = `${baseDir}/${simulationId}/output/simulate/ft_phase_reward_output.txt`
  } else {
    file = `${baseDir}/${simulationId}/output/test/rl_phase_reward_output.txt`
  }

  await fse.access(file, fs.F_OK)

  const r = await csvToObj(file)
  return r
}

async function csvToObj (file) {
  const map = Object.create({})
  return new Promise((resolve, reject) => {
    try {
      fse
        .createReadStream(file)
        .pipe(csv())
        .on('data', row => {
          const target = map[row.tl_name] || []
          target.push({
            phase: row.phase,
            reward: row.reward,
            step: row.step,
            avgSpeed: Number(row.avg_speed).toFixed(3)
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
