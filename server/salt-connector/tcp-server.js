
const debug = require('debug')('salt-connector:tcp-server');
const net = require('net');
const chalk = require('chalk');
const fs = require('fs');
const SaltMsgHandler = require('./salt-msg-handler');
const BufferManager = require('./socket-buffer-manager');
const { Header } = require('./msg');
const hex = require('./hex');

const HEADER_LENGTH = 16;

const { green } = chalk;

const writeStream = fs.createWriteStream('./debug_output');

/**
 * TCP Server
 * @param {number} port
 * @param {Object} queueManager manage communation message channel
 * @param {function} queueManager.getQueue
 */


module.exports = (port = 1337) => {
  let timer;

  const saltMsgHandler = SaltMsgHandler();
  const bufferManager = BufferManager();

  const consumeSaltMsg = (socket, bufferManager) => {
    // console.log('consume', socket.remotePort)
    const buffer = bufferManager.getBuffer(socket);
    if (buffer && buffer.length >= HEADER_LENGTH) {
      const header = Header(buffer);
      // debug(header);
      const handler = saltMsgHandler.get(header.type);
      if (handler) {
        const bodyLength = header.length + HEADER_LENGTH;
        handler(socket, buffer.slice(HEADER_LENGTH, bodyLength));
        bufferManager.setBuffer(socket, buffer.slice(bodyLength));
      } else {
        debug(chalk.red('cannot find handler'));
        bufferManager.setBuffer(socket, Buffer.alloc(0));
      }
    }
    timer = setTimeout(() => consumeSaltMsg(socket, bufferManager), 10);
  };

  const bufferManagerRegistry = {}

  const handleData = socket => (buffer) => {
    // console.log(hex(buffer));
    // writeStream.write(hex(buffer));
    // bufferManager.addBuffer(socket, buffer);
    const bufferManager = bufferManagerRegistry[socket.remotePort]
    bufferManager.addBuffer(socket, buffer);
  };

  const handleClose = socket => () => {
    saltMsgHandler.clearResource(socket);
    const bufferManager = bufferManagerRegistry[socket.remotePort]
    if(bufferManager) {
      bufferManager.deleteBuffer(socket);
    }
    delete bufferManagerRegistry[socket.remotePort]
    clearTimeout(timer);
    debug(chalk.red(`[close]`))
  };

  const handleError = socket => () => {
    debug(green(`[socket-error] ${socket.remoteAddress}`));
  };

  const server = net.createServer((socket) => {
    // console.log('created', socket.remotePort)
    socket.on('data', handleData(socket));
    socket.on('close', handleClose(socket));
    socket.on('error', handleError(socket));

    // const saltMsgHandler = SaltMsgHandler();
    const bufferManager = BufferManager();
    bufferManagerRegistry[socket.remotePort] = bufferManager
    consumeSaltMsg(socket, bufferManager);

  });

  server.on('connection', (socket) => {
    debug(green(`[connection] ${socket.remoteAddress}`));
  });

  server.on('error', (socket) => {
    debug(green(`[server-error] ${socket.remoteAddress}`));
  });

  server.listen(port, '0.0.0.0');
  debug(`start on ${chalk.blue(port)}...`);

  return Object.assign(saltMsgHandler, {
    send: saltMsgHandler.send,
  });
}
