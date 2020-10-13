const debug = require('debug')('server:db');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const TABLE_SIMULATION = 'simulations';
let database;

module.exports = {
  start(file = './db.json') {
    low(new FileAsync(file))
      .then((db) => {
        debug('LowDB connected...');
        database = db;
        if (!database.has(TABLE_SIMULATION).value()) {
          database.defaults({ simulations: [] }).write();
        }
      })
      .catch(err => debug('LowDB connection failed...', err.message));
  },
  getSimulations() {
    return database.get(TABLE_SIMULATION);
  },
};
