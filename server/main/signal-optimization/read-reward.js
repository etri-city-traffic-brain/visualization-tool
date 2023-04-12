const fs = require('fs-extra')
// const csv = require('neat-csv')
const csv = require('csv-parser')
// const fs = require('fs')

const { config } = require('../../globals')

async function read (simulationId) {
  // const file = `/home/ubuntu/uniq-sim/output/${simulationId}/train/train_epoch_tl_reward.txt`
  const file = `${config.base}/data/${simulationId}/output/train/train_epoch_tl_reward.txt`

  try {
    await fs.access(file, fs.F_OK)
    return csvToObj(file)
  } catch (err) {
    return {}
  }
}

async function csvToObj (file) {
  const map = Object.create({})
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(file)
        .pipe(csv())
        .on('data', row => {
          const target = map[row.tl_name] || []
          target.push({
            // phase: row.phase,
            reward: row.reward,
            rewardAvg: row['40ep_reward']
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
