
const mongoose = require('mongoose');
const bboxpolygon = require('../../utils/bboxpolygon');
// const findFeatures = require('../../db/find-features');
// const mongoose = require('../../db/mongo');
// const parseMapReqParam = require('../parse-req-query');

// const findFeatures = require('./find-features');
// const mongoose = require('../../main/dbms/mongo');
const parseMapReqParam = require('../parse-req-query');

module.exports = async (req, res) => {
  const { extent } = parseMapReqParam(req);
  const { db } = mongoose.connection;
  const nodes = await db.collection('signals').find({
    geometry: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [bboxpolygon(extent)],
        },
      },
    },
    // 'properties.SPEEDLH' : { $gt: speed },
  }).toArray();
  res.json({
    features: nodes,
  });
};
