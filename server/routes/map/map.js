const mongoose = require('mongoose')
const findFeatures = require('./find-features')
const parse = require('../../utils/parse-req-query')

module.exports = async (req, res) => {
  const { extent, zoom } = parse(req)
  console.log(extent, zoom)
  const collectionName = zoom <= 16 ? 'ulinks' : 'ucells'

  const collections = mongoose.connection.db.collection(collectionName)
  const links = await findFeatures(collections, {
    extent,
    zoom
  })

  res.json({ features: links })
}

// mongoose.connection.on('open', function (ref) {
//   console.log('Connected to mongo server.')
//   mongoose.connection.db.listCollections().toArray(function (err, names) {
//     console.log(names) // [{ name: 'dbname.myCollection' }]
//   })
// })
