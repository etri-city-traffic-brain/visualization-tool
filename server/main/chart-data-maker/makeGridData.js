
const streamUtil = require('./promiseStream')

const calcGrid = require('./calc-grid')

const {
  base,
} = require('../../config')

const filesToString = (...files) => files.map(file => streamUtil.fileToString(file))

const driver = (from, simulationId, jsonObj) => {
  if (!simulationId) {
    return Promise.reject(Error('You maybe missed simulation id'))
  }
  const simulationDir = `${from}/${simulationId}/output`
  const GRID_BASE_FILE = `${base}/data/grid_.geojson` // link
  const fileNew = `${simulationDir}/grid-data.json`

  return Promise.all(filesToString(GRID_BASE_FILE)).then((strDatas) => {
    const gridData = calcGrid(jsonObj.data, strDatas)
    return streamUtil.objectToFile(fileNew, gridData)
  })

}

module.exports = driver
