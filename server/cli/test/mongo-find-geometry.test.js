const mongoose = require('mongoose');
const { url } = require('../db');
const promise = mongoose.connect(url('map'), {
  useNewUrlParser: true
});

promise.then(async (mongoose) => {
  const { db } = mongoose.connection;

  const result = await db.collection('links').find({
    geometry: {
      $geoWithin: {
        $geometry: {
          type: "Polygon",
          coordinates: [[
            [127.133346, 37.550883],
            [127.161813, 37.550928],
            [127.150096, 37.536782],
            [127.133346, 37.550883],
          ]]
        }
      }
    }
  }).toArray();
  console.log(result.length);
});
