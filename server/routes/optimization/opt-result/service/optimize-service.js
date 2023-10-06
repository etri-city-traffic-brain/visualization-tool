function OptimizeService() {
  function getFixedNum(value, base = 2) {
    if (typeof value !== 'number') return value
    return Number(value.toFixed(base))
  }

  function getImprovementRate(ft, rl) {
    return ft > 0 ? (1 - rl / ft) * 100 : 0
  }

  function optimize(reportFt, reportRl) {
    const improvementRate = getFixedNum(getImprovementRate(reportFt.travelTime, reportRl.travelTime))
    const simulate = {
      avg_speed: getFixedNum(reportFt.avgSpeed),
      travel_time: getFixedNum(reportFt.travelTime),
      travel_times: reportFt.travelTimes.map(travelTime => getFixedNum(travelTime, 2)),
      cumlative_avgs: reportFt.cumlativeAvgs.map(cumlativeAvg => getFixedNum(cumlativeAvg, 2))
    }
    const test = {
      avg_speed: getFixedNum(reportRl.avgSpeed),
      travel_time: getFixedNum(reportRl.travelTime),
      travel_times: reportRl.travelTimes.map(travelTime => getFixedNum(travelTime, 2)),
      cumlative_avgs: reportRl.cumlativeAvgs.map(cumlativeAvg => getFixedNum(cumlativeAvg, 2)),
    }
    const simulateSignalExplain = new Map()
    const intersections = [
      Object.keys(reportFt.intersections),
      Object.keys(reportRl.intersections)
    ].flat(1).reduce((bucket, rlName) => {
      if (rlName in bucket) return bucket
      const obj = { simulate: {}, test: {} }
      const intersectionFt = reportFt.intersections[rlName] || null
      const intersectionRl = reportRl.intersections[rlName] || null
      if (intersectionRl !== null) {
        obj.test.avg_speed = getFixedNum(intersectionRl.avgSpeed)
        obj.test.sum_passed = getFixedNum(intersectionRl.sumPassed)
        obj.test.travel_time = getFixedNum(intersectionRl.travelTime)
        obj.test.travel_times = getFixedNum(intersectionRl.travelTimes)
        obj.test.cumlative_avgs = intersectionRl.cumlativeAvgs.map(cumlativeAvg => getFixedNum(cumlativeAvg, 2))
        obj.test.signal_explain = intersectionRl.signalExplains[intersectionRl.signalExplains.length - 1]
        if (!(simulateSignalExplain.has(rlName))) {
          simulateSignalExplain.set(rlName, intersectionRl.signalExplains[0])
        }
      }
      if (intersectionFt !== null) {
        obj.simulate.avg_speed = getFixedNum(intersectionFt.avgSpeed)
        obj.simulate.sum_passed = getFixedNum(intersectionFt.sumPassed)
        obj.simulate.travel_time = getFixedNum(intersectionFt.travelTime)
        obj.simulate.travel_times = getFixedNum(intersectionFt.travelTimes)
        obj.simulate.cumlative_avgs = intersectionFt.cumlativeAvgs.map(cumlativeAvg => getFixedNum(cumlativeAvg, 2))
      }
      obj.improvement_rate = getFixedNum(getImprovementRate(intersectionFt.travelTime, intersectionRl.travelTime))
      bucket[rlName] = obj
      return bucket
    }, {})
    simulateSignalExplain.forEach((signalExplain, rlName) => {
      intersections[rlName].simulate.signal_explain = signalExplain
    })
    // console.log(intersections)
    return Object.freeze({
      improvement_rate: improvementRate,
      simulate,
      test,
      intersections
    })
  }

  return Object.freeze({
    optimize
  })
}

module.exports = OptimizeService
