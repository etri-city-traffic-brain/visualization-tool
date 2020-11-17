// @ts-check
const debug = require('debug')('salt-connector:ws-server');
const WebSocket = require('ws');
const chalk = require('chalk');
const events = require('events');
const { MsgType } = require('./type');
const msgFactory = require('./msg-factory');
const e = require('express');
const { log } = console;
const serialize = obj => JSON.stringify(obj);
/**
 *
 * @param {{addQueue: function, deleteQueue: function, getQueue: function}}
 * @param {Object} httpServer
 */
module.exports = (httpServer) => {
  const webSocketServer = new WebSocket.Server({server: httpServer});
  const eventBus = Object.create(events.EventEmitter.prototype);
  function handleConnection(client) {
    console.log('connected ws-client')
    client.on('message', (message) => {
      try {
        const obj = JSON.parse(message);
        if (obj.type === MsgType.INIT) { // init from ws
          Object.assign(client, { $simulationId: obj.simulationId });
          console.log('init', obj.simulationId)
        } else if (obj.type === MsgType.SET) {
          obj.extent[3] = obj.extent[3] + 0.001;
          eventBus.emit('salt:set', obj)
          console.log('--- set ---')
          console.log(obj.extent)
        } else if (obj.type === MsgType.STOP) {
          eventBus.emit('salt:stop', obj)
        }
      } catch (err) {
        debug(err.message);
      }
    });

    client.on('close', () => {
      log(chalk.red('disconnected'), client.id, client.$simulationId);
      log('delete queue for', client.$simulationId);
    });

    client.on('error', () => {
      log('error')
    });
  }
  webSocketServer.on('connection', handleConnection);

  const send = (simulationId, data) => {
    webSocketServer.clients.forEach((client) => {
      // @ts-ignore
      if(client.$simulationId === simulationId) {
        client.send(serialize(data))

        // console.log(`send [${client.$simulationId}], [${simulationId}]`)
      }
    })
  }

  return Object.assign(eventBus, {
    clients: webSocketServer.clients,
    send
  })

};
