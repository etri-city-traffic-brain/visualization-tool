const mongoose = require('mongoose');
const findFeatures = require('./find-features');
const parse = require('../../utils/parse-req-query');

module.exports = async (req, res) => {
  // console.log('******************** map *****')
  const { extent, zoom } = parse(req);
  // const collectionName = zoom <= 17 ? 'links' : 'cells';
  const collectionName = zoom <= 17 ? 'ulinks' : 'ucells';

  const collections = mongoose.connection.db.collection(collectionName);
  const links = await findFeatures(collections, {
    extent,
    zoom,
  });
  res.json({ features: links });
};
