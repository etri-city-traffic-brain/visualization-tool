// @ts-check
const debug = require('debug')('salt-connector:ws-server')

const WebSocket = require('ws')
const events = require('events')

const { INIT, SET, STOP } = require('./salt-msg-type').MsgType
const { EVENT_SET, EVENT_STOP } = require('./event-types')

const MsgHandler = (wsClient, eventBus) => ({
  [INIT] (msg) {
    Object.assign(wsClient, {
      $simulationId: msg.simulationId
    })
  },
  [SET] (msg) {
    eventBus.emit(EVENT_SET, msg)
  },
  [STOP] (msg) {
    eventBus.emit(EVENT_STOP, msg)
  }
})

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer })
  const eventBus = Object.create(events.EventEmitter.prototype)

  function handleConnection (client) {
    const msgHandler = MsgHandler(client, eventBus)

    client.on('message', (data) => {
      try {
        const msg = JSON.parse(data)
        const handler = msgHandler[msg.type] || (() => {})
        handler(msg)
      } catch (err) {
        debug(err.message)
      }
    })

    client.on('close', () => {

    })

    client.on('error', () => {

    })
  }

  wss.on('connection', handleConnection)

  const send = (simulationId, data) => {
    wss.clients.forEach((client) => {
      // @ts-ignore
      console.log(client.$simulationId, simulationId)
      if (client.$simulationId === simulationId) {
        client.send(JSON.stringify(data))
        console.log('xxx')
      }
    })
  }
  return Object.assign(eventBus, { send })
}
