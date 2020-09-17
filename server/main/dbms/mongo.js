/* eslint-disable no-console */
const mongoose = require('mongoose');
const chalk = require('chalk');

const { log } = console;

const {
  config: {
    dbms: { mongodbUrl, mongoOption },
  },
} = global.SALT;

log(mongoOption);

const db = mongoose.connection;
let lastReconnectAttempt; // saves the timestamp of the last reconnect attempt
db.on('error', (error) => {
  log(chalk.red(`Error in MongoDb connection: ${error}`));
  mongoose.disconnect();
});
db.on('disconnected', () => {
  log(chalk.red('MongoDB disconnected!'));
  const now = new Date().getTime();
  // check if the last reconnection attempt was too early
  if (lastReconnectAttempt && now - lastReconnectAttempt < 5000) {
    // if it does, delay the next attempt
    const delay = 5000 - (now - lastReconnectAttempt);
    console.log(`reconnecting to MongoDB in ${delay}mills`);
    setTimeout(() => {
      log(chalk.blue('reconnecting to MongoDB'));
      lastReconnectAttempt = new Date().getTime();
      mongoose.connect(mongodbUrl, { server: { auto_reconnect: true } });
    }, delay);
  } else {
    log(chalk.blue('reconnecting to MongoDB'));
    lastReconnectAttempt = now;
    mongoose.connect(mongodbUrl, { server: { auto_reconnect: true } });
  }
});

mongoose.connect(mongodbUrl, mongoOption).then(() => {

}).catch((err) => {
  log(chalk.red(err.message));
});

module.exports = mongoose;
