
const dropCollection = async (mongoose, db, collection) => {
  const targetDb = mongoose.connection.useDb(db);
  await targetDb.collection(collection).drop();
};

const isConnected = mongoose => mongoose.connection.readyState === 1;

module.exports = {
  dropCollection,
  isConnected,
};
