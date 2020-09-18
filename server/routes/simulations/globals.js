//    Utilities

const moment = require('moment');
const dbUtils = require('../../main/dbms/db-utils');

const db = require('../../main/dbms/db');

const { getSimulations } = db;

// const { db: { getSimulations } } = global.SALT;

const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);

const currentTime = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  updatetStatus,
  currentTime,
};
