const mongoose = require('mongoose');
const findFeatures = require('./find-features');
// const mongoose = require('../../main/dbms/mongo');
const parseMapReqParam = require('../parse-req-query');

module.exports = async (req, res) => {
  const { extent, zoom } = parseMapReqParam(req);
  const collectionName = zoom <= 17 ? 'links' : 'cells';

  const collections = mongoose.connection.db.collection(collectionName);
  const links = await findFeatures(collections, {
    extent,
    zoom,
  });
  res.json({ features: links });
};
