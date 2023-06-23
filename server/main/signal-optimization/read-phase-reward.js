const fse = require('fs-extra')
const fs = require('fs')
const csv = require('csv-parser')
const { config } = require('../../globals')

const baseDir = `${config.base}/data`

async function read(simulationId, type) {
  let file
  if (type === 'ft') {
    file = `${baseDir}/${simulationId}/output/simulate/ft_phase_reward_output.txt`
  } else {
    file = `${baseDir}/${simulationId}/output/test/rl_phase_reward_output.txt`
  }

  try {
    console.log('che s')
    console.log('che s')
    console.log('che s')
    await fse.access(file, fs.F_OK)
    console.log('che e')

    const r = await csvToObj(file)
    return r
  } catch (err) {
    console.log('I*e')
    console.log(err.message)
    return {}
  }
}

async function csvToObj(file) {
  const map = Object.create({})
  return new Promise((resolve, reject) => {
    let i = 0
    const start = Date.now()
    try {
      fse
        .createReadStream(file)
        .pipe(csv())
        .on('data', row => {
          let avgTravelTime =
            Number(row.sum_travel_time) === 0
              ? 0
              : Number(row.sum_travel_time) / Number(row.sum_passed)

          const target = map[row.tl_name] || []
          target.push({
            phase: row.phase,
            reward: row.reward,
            step: row.step,
            action: row.actions,
            avgSpeed: Number(row.avg_speed).toFixed(3),
            sumPassed: Number(row.sum_passed),
            sumTravelTime: Number(row.sum_travel_time),
            avgTravelTime
          })
          map[row.tl_name] = target
          i += 1
        })
        .on('end', () => {
          console.log(Date.now() - start, 'total:', i)
          resolve(map)
        })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = read
