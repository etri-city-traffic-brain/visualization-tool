/* eslint-disable global-require */
/**
 * SALT-VIS Server Main
 * author: beanpole
 * last modified: 2019-6-5
 */

global.SALT = global.SALT || {};
global.SALT.config = require('./config');
global.SALT.mongooseUtils = require('./main/dbms/mongo-utils');
global.SALT.findFeatures = require('./routes/map/find-features');
global.SALT.services = require('./main/service');

// global.SALT.db = require('./main/dbms/db');

const mongoose = require('mongoose');
const config = require('./config');
const mongoDB = require('./main/dbms/init-mongoose');
const lowDB = require('./main/dbms/db');

mongoDB.init(config, mongoose);
lowDB.init('./db.json');

const app = require('./app');

module.exports = {
  app,
};
