
const server = require('./server');

module.exports = server;

module.exports = {
  start({tcpPort, wsPort}) {
    server({tcpPort, wsPort})
  }
}
