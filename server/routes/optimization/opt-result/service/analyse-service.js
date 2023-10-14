const IntersectionFactory = require('../model/intersection')
const Report = require('../model/report')

// function AnalyseService () {
//   let intersectionFactory = null

//   const report = Report()
//   function onLine (line) {
//     const data = line.split(',')
//     if (intersectionFactory === null) {
//       intersectionFactory = IntersectionFactory(data)
//       return
//     }
//     const intersection = intersectionFactory.make(data)
//     report.init(intersection.step)
//     report.make(intersection)
//   }
//   function get () {
//     return report.get()
//   }

//   return Object.freeze({ onLine, get })
// }

function AnalyseService() {
  let intersectionFactory = null
  const intersections = []
  let maxStep = 0

  const report = Report()
  function onLine(line) {
    const data = line.split(',')
    if (intersectionFactory === null) {
      intersectionFactory = IntersectionFactory(data)
      return
    }
    const intersection = intersectionFactory.make(data)
    intersections.push(intersection)
    maxStep = intersection.step
  }

  function getMaxStep() {
    return maxStep
  }
  function get(maxStep = 0) {
    intersections.forEach(intersection => {
      if (intersection.step > maxStep) return
      report.init(intersection.step)
      report.make(intersection)
    })
    return report.get()
  }

  return Object.freeze({ onLine, get, getMaxStep })
}
module.exports = AnalyseService
