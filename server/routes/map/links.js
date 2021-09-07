const mongoose = require('mongoose')
const findFeatures = require('./find-features')
// const mongoose = require('../../main/dbms/mongo');
const parseMapReqParam = require('../../utils/parse-req-query')

module.exports = async (req, res) => {
  console.log('********************** links **********************')

  console.log(req.params.linkId)
  const collection = mongoose.connection.db.collection('ulinks')
  if (req.params.linkId) {
    const link = await collection.find({
      'properties.LINK_ID': req.params.linkId
      // linkId: req.params.linkId
    })
    console.log(await link.toArray())
    const links = await link.toArray()
    res.send(links[0])
    return
  }

  const { extent } = parseMapReqParam(req)
  // const collection = mongoose.connection.db.collection('links');
  // const collection = mongoose.connection.db.collection('ulinks')
  const links = await findFeatures(collection, {
    extent,
    zoom: 17
  })
  res.json({ features: links })
}
