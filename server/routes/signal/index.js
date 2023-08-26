//    Traffic Signal Converter API for SALT
//    2019

const router = require('express').Router()
const debug = require('debug')('api:signal')

const parse = require('../../main/signal-parser/parseAgent')

/**
 * convert JSON to XML
 */
router.post('/', async (req, res) => {
  const { json, from, to } = req.body
  try {
    const xmlStr = await parse({ json, from, to })
    res.setHeader('content-type', 'text/plain')
    res.send(xmlStr)
  } catch (e) {
    debug(e)
    res.status(400).send(e.message)
  }
})

module.exports = router
