function Intersection(data) {
  const step = Number(data.step)
  const tlName = data.tl_name
  const actions = data.actions
  const reward = Number(data.reward || 0)
  const avgSpeed = Number(data.avg_speed || 0)
  const avgTravelTime = Number(data.avg_travel_time || 0)
  const sumPassed = Number(data.sum_passed || 0)
  const sumTravelTime = Number(data.sum_travel_time || 0)

  return Object.freeze({
    step,
    tlName,
    actions,
    reward,
    avgSpeed,
    avgTravelTime,
    sumPassed,
    sumTravelTime
  })
}
function IntersectionFactory(header) {
  function make(data) {
    const obj = {}
    for (let i = 0; i < Math.min(data.length, header.length); i += 1) {
      const key = header[i]
      const value = data[i]
      obj[key] = value
    }
    const intersection = Intersection(obj)
    return intersection
  }

  return Object.freeze({ make })
}

module.exports = IntersectionFactory
