/* eslint-disable global-require */
/**
 * SALT-VIS Server Main
 * author: beanpole
 * last modified: 2019-6-5
 */

global.SALT = global.SALT || {};
global.SALT.config = require('./config');
global.SALT.mongoose = require('./main/dbms/mongo');
global.SALT.mongooseUtils = require('./main/dbms/mongo-utils');
global.SALT.findFeatures = require('./routes/map/find-features');
global.SALT.services = require('./main/service');
global.SALT.db = require('./main/dbms/db');
global.SALT.dbUtils = require('./main/dbms/db-utils');

const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PUBLIC = path.join(__dirname, 'public');
const VIEWS = path.join(__dirname, 'views');
const FAVICON = favicon(`${__dirname}/public/favicon.ico`);

app.set('views', VIEWS);
app.set('view engine', 'ejs');

app.all('/*', require('./utils/cors'));

app.use(FAVICON);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(PUBLIC));


app.use('/', require('./routes/index'));
app.use('/simulation', require('./routes/simulation-result'));
app.use('/simulations', require('./routes/simulations'));
app.use('/predictions', require('./routes/predictions'));
app.use('/data', require('./routes/data'));

app.use('/salt/v1/map', require('./routes/map'));
app.use('/salt/v1/statistics', require('./routes/statistics/index'));
app.use('/salt/v1/junction/', require('./routes/junction'));
app.use('/salt/v1/signal/jsontoxml/', require('./routes/signal'));
app.use('/salt/v1/status', require('./routes/simulation-status'));
app.use('/salt/v1/simulations', require('./routes/simulations'));

app.use(require('./express-middleware/not-found'));
app.use(require('./express-middleware/server-error'));

module.exports = app;
