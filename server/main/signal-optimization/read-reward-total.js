const fs = require('fs-extra')
const csv = require('csv-parser')

const { config } = require('../../globals')

async function read(simulationId) {
  const file = `${config.base}/opt/${simulationId}/output/train/train_epoch_total_reward.txt`
  try {
    await fs.access(file, fs.F_OK)
    return csvToObj(file)
  } catch (err) {
    console.log(err.message)
    return {}
  }
}

async function csvToObj(file) {
  const map = Object.create({})
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(file)
        .pipe(csv())
        .on('data', row => {
          const target = map[row.tl_name] || []
          if (row.reward) {
            target.push({
              // phase: row.phase,
              reward: row.reward,
              rewardAvg: row['40ep_reward']
            })
            map[row.tl_name] = target
          }
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
