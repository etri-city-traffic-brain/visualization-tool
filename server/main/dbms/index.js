const mongoConnector = require('./init-mongoose');
const lowdbConnector = require('./init-db');

module.exports = (db) => {
  mongoConnector.start(db);
  lowdbConnector.start(db);
}
