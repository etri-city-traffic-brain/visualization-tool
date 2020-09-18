const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const TABLE_SIMULATION = 'simulations';
const { log } = console;
let database;

module.exports = {
  init(file = './db.json') {
    low(new FileAsync(file))
      .then((db) => {
        log('LowDB connected...');
        database = db;
        if (!database.has(TABLE_SIMULATION).value()) {
          database.defaults({ simulations: [] }).write();
        }
      })
      .catch(err => log('LowDB connection failed...', err.message));
  },
  getSimulations() {
    return database.get(TABLE_SIMULATION);
  },
};
