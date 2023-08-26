const fs = require('fs')
const csv = require('fast-csv')

function calc(filePath) {

  const stream = fs.createReadStream(filePath)

  return new Promise((resolve, reject) => {
    const result = []
    const handleData = row => {
      // 평균 통행 시간
      // const avgTravelTime = row.ft_SumTravelTime_sum_0hop / row.ft_VehPassed_sum_0hop
      const ft_averageTravelTime = row.ft_SumTravelTime_sum_0hop / row.ft_VehPassed_sum_0hop || 1
      const rl_averageTravelTime = row.rl_SumTravelTime_sum_0hop / row.rl_VehPassed_sum_0hop || 1

      const improvedRate = (ft_averageTravelTime - rl_averageTravelTime) / ft_averageTravelTime * 100

      if (row.name === 'name') {
        return
      }
      result.push({
        name: row.name,
        SA: row.SA,
        ftAverageSpeed: Number(row.ft_AverageSpeed_mean_0hop).toFixed(2),
        ftVehPassed: Number(row.ft_VehPassed_sum_0hop), // 기존 통행량
        ftAvgTravelTime: Number(ft_averageTravelTime.toFixed(2)), // 기존 통행 시간
        rlAvgTravelTime: Number(rl_averageTravelTime.toFixed(2)),
        improvedRate: Number(improvedRate.toFixed(2)) // 통과시간 개선률
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
      rl_AverageSpeed_mean_0hop, imp_AverageSpeed_mean_0hop, ft_AverageSpeed_mean_1hop, rl_AverageSpeed_mean_1hop, imp_AverageSpeed_mean_1hop, ft_WaitingTime_sum_0hop, rl_WaitingTime_sum_0hop, imp_WaitingTime_sum_0hop, ft_WaitingTime_sum_1hop, rl_WaitingTime_sum_1hop, imp_WaitingTime_sum_1hop, ft_AverageDensity_mean_0hop, rl_AverageDensity_mean_0hop, imp_AverageDensity_mean_0hop, ft_AverageDensity_mean_1hop, rl_AverageDensity_mean_1hop, imp_AverageDensity_mean_1hop,
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
      rl_SumTravelTime_sum_0hop
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
