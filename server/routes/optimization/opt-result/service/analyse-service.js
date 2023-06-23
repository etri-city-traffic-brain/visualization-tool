const IntersectionFactory = require('../model/intersection')
const Report = require('../model/report')

function AnalyseService () {
  let intersectionFactory = null

  const report = Report()
  function onLine (line) {
    const data = line.split(',')
    if (intersectionFactory === null) {
      intersectionFactory = IntersectionFactory(data)
      return
    }
    const intersection = intersectionFactory.make(data)
    report.init(intersection.step)
    report.make(intersection)
  }
  function get () {
    return report.get()
  }

  return Object.freeze({ onLine, get })
}

module.exports = AnalyseService
