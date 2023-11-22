// const Grid = require('./grid')

module.exports = GridData

function GridData(cells = {}, strGridFeatureCollection = '') {
  const size = Object.values(cells)[0].values.length
  const gridFeatureCollection = JSON.parse(strGridFeatureCollection)

  const maps = (gridFeatureCollection?.features || []).reduce(({ gridById, gridsByLinkId }, gridFeature) => {
    const id = gridFeature?.properties?.GRID_ID || null
    if (id === null) return { gridById, gridsByLinkId }
    const linkIds = gridFeature?.properties?.LINKS || []
    const grid = Grid(size)
    gridById.set(id, grid)
    for (const linkId of linkIds) {
      const grids = gridsByLinkId.get(linkId) || []
      if (!gridsByLinkId.has(linkId)) gridsByLinkId.set(linkId, [])
      grids.push(grid)
    }
    return { gridById, gridsByLinkId }
  }, { gridById: new Map(), gridsByLinkId: new Map() })

  Object.values(cells).forEach(cell => {
    const grids = maps.gridsByLinkId.get(cell.linkId) || []
    cell.values.forEach((avgSpeed, idx) => {
      grids.forEach(grid => grid.calculateAvgSpeed(avgSpeed, idx))
    })
  })

  const obj = {}
  for (const [gridId, grid] of maps.gridById) {
    obj[gridId] = grid.avgSpeeds.map(calc => {
      return Number(calc.get().toFixed(2))
    })
  }
  return obj
}

function Grid(size) {
  const avgSpeeds = []
  for (let i = 0; i < size; i += 1) {
    avgSpeeds.push(CalculatorAvg())
  }
  function calculateAvgSpeed(avgSpeed, idx) {
    const calcAvgSpeed = avgSpeeds[idx]
    calcAvgSpeed.calculate(avgSpeed)
  }

  return Object.freeze({
    calculateAvgSpeed,
    avgSpeeds
  })
}

function CalculatorAvg() {
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
    savedValue = newValue
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
