//    db.js
//    init lowdb
//    singleton

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const { simulation: { dbFile } } = require('../../config');

const TABLE_SIMULATION = 'simulations';

let db;

(async () => {
  db = await low(new FileAsync(dbFile));
  if (!db.has(TABLE_SIMULATION).value()) {
    db.defaults({ simulations: [] }).write();
  }
})();

function getSimulations() {
  return db.get(TABLE_SIMULATION);
}

module.exports = {
  getSimulations,
};
