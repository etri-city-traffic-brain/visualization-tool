const express = require('express')
const { link } = require('fs-extra')

const mongoose = require('mongoose')
const findFeatures = require('../../routes/map/find-features')

const parseMapReqParam = require('../../utils/parse-req-query')

const router = express.Router()

const useDb = name => mongoose.connection.useDb(name)

const DB_SIMULATION_RESULT = 'simulation_results'
const DB_MAP = 'map'
const MAP_LINK = 'links'

const arrayToObj = (array, key) => array.reduce((acc, cur) => {
  acc[cur[key]] = cur.values
  return acc
}, {})

const makeCellId = ({ properties = {} }) => {
  const { LINK_ID, LANE_ID, SECTION_ID } = properties
  if (properties.LANE_ID) {
    return `${LINK_ID}_${SECTION_ID}_${LANE_ID}`
  }
  return `${LINK_ID}`
}

/**
 * find links(cells) inside extent
 * and get speeds per link
 * and return it
 */
router.get('/:id', async (req, res) => {
  const { type: linkOrCell = 'links', extent, zoom = 17 } = parseMapReqParam(req)

  if (!extent) {
    res.status(400)
    res.send({
      error: 'extent=[minx, miny, maxx, maxy] missed'
    })
    return
  }

  const map = {
    links: 'ulinks',
    cells: 'ucells'
  }

  const collectionName = map[linkOrCell]

  const { id: simulationId } = req.params
  console.log(simulationId, linkOrCell)
  const collection = useDb(DB_MAP).collection(collectionName)
  const features = await findFeatures(collection, { extent, zoom })

  const fieldName = (linkOrCell === MAP_LINK) ? 'linkId' : 'cellId'
  const speeds = await useDb(DB_SIMULATION_RESULT)
    .collection(simulationId)
    .find({
      [fieldName]: {
        $in: features.map(makeCellId)
      }
    })
    .toArray()
  res.json(arrayToObj(speeds, fieldName))
})

module.exports = router
