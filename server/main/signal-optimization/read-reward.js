const fs = require('fs-extra')
const csv = require('csv-parser')

const { config } = require('../../globals')

const file = 'train_epoch_tl_reward.txt'

async function read(simulationId) {

  const filePath = `${config.base}/opt/${simulationId}/output/train/${file}`

  try {
    await fs.access(filePath, fs.F_OK)
    return csvToObj(filePath)
  } catch (err) {
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
