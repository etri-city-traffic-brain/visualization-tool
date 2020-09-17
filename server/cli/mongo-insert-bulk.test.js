const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/map'
const promise = mongoose.connect(mongoDB, {
  // useMongoClient: true //mongoDB 버전 4.11 이상부터 해주어야 에러 안남
  useNewUrlParser: true
});


promise.then(async (mongoose) => {
  const { db } = mongoose.connection;

  const bulk = db.collection('s1').initializeOrderedBulkOp()

  const myData = [
    { id: 's1', speeds: [1,2,3,4,5] },
    { id: 's2', speeds: [2,3,4,5,6] },
  ]

  myData.forEach(document => {
    bulk.insert(document)
  });

  const result = await bulk.execute();
  console.log(result);
});
