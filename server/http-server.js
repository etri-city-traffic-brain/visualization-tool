const debug = require('debug')('server:web');
const http = require('http');
const config = require('./config');

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  switch (error.code) {
  case 'EACCES':
    console.error(`${bind} requires elevated privileges`);
    break;
  case 'EADDRINUSE':
    console.error(`${bind} is already in use`);
    break;
  default:
    throw error;
  }
}

const onListening = server => () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
};

module.exports = (app, port) => {
  const server = http.createServer(app);
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening(server));
  return server
}
