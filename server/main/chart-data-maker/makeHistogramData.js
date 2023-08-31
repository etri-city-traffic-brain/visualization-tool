const promiseStream = require('./promiseStream')

/**
 * This function is called when make histogram
 * @param {string} strData
 * @return {object}
 */

function getColor(value, min, max) {
  if (value > max) value = max
  var v = (value - min) / (max - min)
  var hue = ((1 - v) * 120).toString(10)
  return ['hsl(', hue, ',100%,50%)'].join('')
}

const calcTotalStep = meta =>
  meta.period === 0 ? 0 : meta.duration / meta.period

const Filler = (value = 0) => size => new Array(size).fill(value)

function makeHistogram(strData) {

  const { meta, data: speedsPerLinks } = strData
  const labels = [0, 10, 20, 30, 40, 50, 60, 70, '']

  const TOTAL_STEP = calcTotalStep(meta)
  const LABEL_SIZE = labels.length

  const linkIds = Object.keys(speedsPerLinks)
  const zeroFill = Filler()

  const getBucketId = value => {
    const index = Math.floor(value / 10)
    return index >= LABEL_SIZE ? LABEL_SIZE - 1 : index
  }

  const stepDatas = []
  for (let stepIndex = 0; stepIndex < TOTAL_STEP; stepIndex += 1) {
    const stepData = linkIds.reduce((bucket, linkId) => {
      const linkSpeeds = speedsPerLinks[linkId].values
      const bucketId = getBucketId(linkSpeeds[stepIndex])
      bucket[bucketId] += 1
      return bucket
    }, zeroFill(LABEL_SIZE))

    stepDatas.push(stepData)
  }

  const totalData = (() => {
    const summaryData = linkIds.reduce((bucket, linkId) => {
      const linkSpeeds = speedsPerLinks[linkId].values
      const bucketId = getBucketId(
        linkSpeeds.reduce((sumOfSpeed, speed) => sumOfSpeed + speed, 0) /
        linkSpeeds.length
      )
      bucket[bucketId] = bucket[bucketId] + 1
      return bucket
    }, zeroFill(LABEL_SIZE))
    return summaryData
  })()

  const backgroundColor = totalData.map(data => getColor(data, 0, Math.max(...totalData)))


  return {
    labels,
    backgroundColor,
    stepDatas,
    totalData
  }
}

const driver = (from, simulationId, jsonObj) =>
  new Promise((resolve, reject) => {
    if (!simulationId) {
      return reject(Error('You maybe missed simulation id'))
    }
    const simulationDir = `${from}/${simulationId}/output`
    try {
      const fileOrigin = `${simulationDir}/${simulationId}.json`
      const fileNew = `${simulationDir}/histogram-data.json`

      // promiseStream.fileToString(fileOrigin).then((strData) => {
      const fileData = makeHistogram(jsonObj)
      promiseStream
        .objectToFile(fileNew, fileData)
        .then(result => {
          // console.log(result);
          resolve()
        })
        .catch(err => reject(err))
    } catch (err) {
      reject(err)
    }
  })

module.exports = driver
