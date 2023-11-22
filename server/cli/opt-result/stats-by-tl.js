const fs = require('fs')
const csv = require('fast-csv')

function asFixedNumber(value) {
  return Number(value).toFixed(2)
}

function calc(filePath) {

  const stream = fs.createReadStream(filePath)

  return new Promise((resolve, reject) => {
    const result = []
    const handleData = row => {

      const ftAverageTravelTime = row.ft_SumTravelTime_sum_0hop / (row.ft_VehPassed_sum_0hop || 1)
      const rlAverageTravelTime = row.rl_SumTravelTime_sum_0hop / (row.rl_VehPassed_sum_0hop || 1)

      // 통과시간 개선률(%)
      const improvedRate = (ftAverageTravelTime - rlAverageTravelTime) / ftAverageTravelTime * 100

      if (row.name === 'name') {
        return
      }
      result.push({
        name: row.name,
        SA: row.SA,

        ftAverageSpeed: asFixedNumber(row.ft_AverageSpeed_mean_0hop),
        rlAverageSpeed: asFixedNumber(row.rl_AverageSpeed_mean_0hop),

        ftVehPassed: asFixedNumber(row.ft_VehPassed_sum_0hop),
        rlVehPassed: asFixedNumber(row.rl_VehPassed_sum_0hop),

        ftAvgTravelTime: asFixedNumber(ftAverageTravelTime),
        rlAvgTravelTime: asFixedNumber(rlAverageTravelTime),

        improvedRate: asFixedNumber(improvedRate) // 통과시간 개선률
      })

    }

    const handleEnd = async () => {
      resolve(result)
      stream.close()
    }

    const handleError = (err) => {
      reject(err)
      stream.close()
    }

    const transform = ([
      name, SA,
      ft_VehPassed_sum_0hop,
      rl_VehPassed_sum_0hop,
      imp_VehPassed_sum_0hop, ft_VehPassed_sum_1hop, rl_VehPassed_sum_1hop, imp_VehPassed_sum_1hop,
      ft_AverageSpeed_mean_0hop,
      rl_AverageSpeed_mean_0hop,
      imp_AverageSpeed_mean_0hop, ft_AverageSpeed_mean_1hop, rl_AverageSpeed_mean_1hop, imp_AverageSpeed_mean_1hop, ft_WaitingTime_sum_0hop, rl_WaitingTime_sum_0hop, imp_WaitingTime_sum_0hop, ft_WaitingTime_sum_1hop, rl_WaitingTime_sum_1hop, imp_WaitingTime_sum_1hop, ft_AverageDensity_mean_0hop, rl_AverageDensity_mean_0hop, imp_AverageDensity_mean_0hop, ft_AverageDensity_mean_1hop, rl_AverageDensity_mean_1hop, imp_AverageDensity_mean_1hop,
      ft_SumTravelTime_sum_0hop,
      rl_SumTravelTime_sum_0hop,
      imp_SumTravelTime_sum_0hop, ft_SumTravelTime_sum_1hop, rl_SumTravelTime_sum_1hop, imp_SumTravelTime_sum_1hop, ft_WaitingQLength_mean_0hop, rl_WaitingQLength_mean_0hop, imp_WaitingQLength_mean_0hop, ft_WaitingQLength_mean_1hop, rl_WaitingQLength_mean_1hop,
      imp_WaitingQLength_mean_1hop
    ]) => ({
      name, SA,
      ft_AverageSpeed_mean_0hop,
      ft_VehPassed_sum_0hop,
      rl_VehPassed_sum_0hop,
      ft_SumTravelTime_sum_0hop,
      rl_SumTravelTime_sum_0hop,
      rl_AverageSpeed_mean_0hop
    })

    csv
      .fromStream(stream)
      .transform(transform)
      .on('data', handleData)
      .on('end', handleEnd)
      .on('error', handleError)
  })

}

module.exports = calc


if (require.main === module) {
  calc('data.csv').then(result => console.log(result))
}
