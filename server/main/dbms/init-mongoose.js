/* eslint-disable no-console */

const chalk = require('chalk');

const { log } = console;

function init({ mongodbUrl, mongoOption }, mongoose) {
  const { connection } = mongoose;
  let lastReconnectAttempt; // saves the timestamp of the last reconnect attempt

  const connectionError = () => mongoose.disconnect();
  const connectionDisconnected = () => {
    log(chalk.red('MongoDB disconnected!'));
    const now = new Date().getTime();
    // check if the last reconnection attempt was too early
    if (lastReconnectAttempt && now - lastReconnectAttempt < 5000) {
    // if it does, delay the next attempt
      const delay = 5000 - (now - lastReconnectAttempt);
      log(chalk.blue(`reconnecting to MongoDB in ${delay}mills`));
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
  };

  connection.on('error', connectionError);
  connection.on('disconnected', connectionDisconnected);

  const connected = () => log('MongoDB connected...');
  const error = err => log(chalk.red(err.message));

  mongoose
    .connect(mongodbUrl, mongoOption)
    .then(connected)
    .catch(error);
}

module.exports = {
  init,
};
