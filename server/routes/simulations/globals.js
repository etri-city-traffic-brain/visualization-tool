//    Utilities

const moment = require('moment');

const { db: { getSimulations }, dbUtils } = global.SALT;

const updatetStatus = dbUtils.simulationStatusUpdater(getSimulations);

const currentTime = () => moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  updatetStatus,
  currentTime,
};
