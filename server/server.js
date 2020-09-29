/* eslint-disable global-require */
/**
 * SALT-VIS Server Main
 * author: beanpole
 * last modified: 2019-6-5
 */

const mongoose = require('mongoose');
const config = require('./config');
const mongoDB = require('./main/dbms/init-mongoose');
const lowDB = require('./main/dbms/init-db');

mongoDB.init(config, mongoose);
lowDB.init('./db.json');

const app = require('./app');

module.exports = {
  app,
};
