function Calculator(algorithm = (savedValue = 0, value = 0) => savedValue + value) {
  let savedValue = 0

  const instance = Object.freeze({
    calculate,
    get,
    set,
    reset
  })
  function calculate(value) {
    const newValue = algorithm(savedValue, value)
    if (isNaN(newValue)) return savedValue
    savedValue = algorithm(savedValue, value)
    return savedValue
  }
  function get() {
    return savedValue
  }
  function set(value) {
    savedValue = value
    return instance
  }
  function reset() {
    return instance.set(0)
  }
  return instance
}

function AlgorithmAvg() {
  let savedCount = 0
  const instance = Object.freeze({
    calculate,
    getCount,
    setCount,
    reset
  })
  function calculate(savedValue, value) {
    savedCount += 1
    return savedValue + (value - savedValue) / savedCount
  }
  function getCount() {
    return savedCount
  }
  function setCount(count) {
    savedCount = count
    return instance
  }
  function reset() {
    instance.setCount(0)
    return instance
  }
  return instance
}
Calculator.Avg = function CalculatorAvg() {
  const algorithmAvg = AlgorithmAvg()
  const calculator = Calculator(algorithmAvg.calculate)

  const instance = Object.freeze({
    ...calculator,
    set,
    reset
  })
  function set(value = calculator.get(), count = algorithmAvg.getCount()) {
    calculator.set(value)
    algorithmAvg.set(count)
    return instance
  }
  function reset() {
    calculator.reset()
    algorithmAvg.reset()
    return instance
  }
  return instance
}

Calculator.Sum = function CalculatorSum() {
  function algorithm(savedValue, value) {
    return savedValue + value
  }
  const calculator = Calculator(algorithm)
  return calculator
}

module.exports = Object.freeze(Calculator)
