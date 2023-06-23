const Calculator = require('./calculator')

function getAvgTT(sumTravelTime, sumPassed) {
  return sumPassed > 0 ? sumTravelTime / sumPassed : 0
}

function IntersectionCollector() {
  let signalExplain = null
  const cumlativeAvgs = []
  const calcSumTravelTime = Calculator.Sum()
  const calcSumPassed = Calculator.Sum()

  function collect(intersection) {
    signalExplain = intersection.actions
    calcSumTravelTime.calculate(intersection.sumTravelTime)
    calcSumPassed.calculate(intersection.sumPassed)
    cumlativeAvgs.push(getAvgTT(calcSumTravelTime.get(), calcSumPassed.get()))
  }

  function get() {
    const travelTime = getAvgTT(calcSumTravelTime.get(), calcSumPassed.get())
    return Object.freeze({
      travelTime,
      cumlativeAvgs,
      signalExplain
    })
  }

  return Object.freeze({ collect, get })
}

function Report() {
  let baseStep = null
  const travelTimes = []
  const intersectionMap = new Map()
  const calcStep = Calculator.Sum()
  const calcAvgSpeed = Calculator.Avg()
  const calcSumTravelTime = Calculator.Sum()
  const calcSumPassed = Calculator.Sum()
  const calcSumTravelTimeStep = Calculator.Sum()
  const calcSumPassedStep = Calculator.Sum()

  function init(step, force = false) {
    if (!validInit(baseStep, force)) return
    baseStep = step
    travelTimes.splice(0, calcStep.get())
    intersectionMap.clear()
    calcStep.reset()
    calcAvgSpeed.reset()
    calcSumTravelTime.reset()
    calcSumPassed.reset()
    calcSumTravelTimeStep.reset()
  }
  function validInit(baseStep = null, force = false) {
    return baseStep === null || force === true
  }

  function make(intersection) {
    const { tlName, ...data } = intersection
    if (data.step !== baseStep + calcStep.get()) {
      calcStep.calculate(1)
      travelTimes.push(getAvgTT(calcSumTravelTimeStep.get(), calcSumPassedStep.get()))
      calcSumTravelTimeStep.reset()
      calcSumPassedStep.reset()
    }

    calcAvgSpeed.calculate(data.avgSpeed)
    calcSumTravelTime.calculate(data.sumTravelTime)
    calcSumPassed.calculate(data.sumPassed)

    calcSumTravelTimeStep.calculate(data.sumTravelTime)
    calcSumPassedStep.calculate(data.sumPassed)

    if (!intersectionMap.has(tlName)) {
      intersectionMap.set(tlName, IntersectionCollector())
    }
    const intersectionCollector = intersectionMap.get(tlName)
    intersectionCollector.collect(data)
  }

  function get() {
    const avgSpeed = calcAvgSpeed.get()
    const travelTime = getAvgTT(calcSumTravelTime.get(), calcSumPassed.get())
    const intersections = {}
    intersectionMap.forEach((intersectionCollector, tlName) => {
      intersections[tlName] = intersectionCollector.get()
    })
    return Object.freeze({
      avgSpeed,
      travelTime,
      travelTimes,
      intersections
    })
  }

  return Object.freeze({ init, make, get })
}

module.exports = Report
