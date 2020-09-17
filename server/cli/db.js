const mongoose = require('mongoose');

const urlBase = 'mongodb://localhost:27017/';
const url = dbName => `${urlBase}${dbName}`;

const connect = async dbName => mongoose.connect(url(dbName), { useNewUrlParser: true });

module.exports = {
  url,
  connect,
};
