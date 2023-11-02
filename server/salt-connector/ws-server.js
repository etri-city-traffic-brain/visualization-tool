// @ts-check
const debug = require('debug')('salt-connector:ws-server')

const WebSocket = require('ws')
const events = require('events')

// const readline = require('linebyline')
const readline = require('readline')

const { INIT, SET, STOP } = require('./salt-msg-type').MsgType
const { EVENT_SET, EVENT_STOP } = require('./event-types')

const MsgHandler = (wsClient, eventBus) => ({
  [INIT](msg) {
    Object.assign(wsClient, {
      $simulationId: msg.simulationId
    })
  },
  [SET](msg) {
    eventBus.emit(EVENT_SET, msg)
  },
  [STOP](msg) {
    eventBus.emit(EVENT_STOP, msg)
  }
})

const path = require('path')
const fs = require('fs')

const config = require('../config')
// const tFile = path.join(config.saltPath.output, 'SIMU_202011_00700', 'log.csv')

const wait = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({})
  }, 300)
})

function Replayer(send) {
  let fileStream = null
  let rl = null
  let needToStop = false
  async function init(simulationId, file) {
    needToStop = false
    if (fileStream) {
      fileStream.close()
      rl.close()
    }
    fileStream = fs.createReadStream(file)
    rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    for await (const line of rl) {
      if (needToStop) {
        return
      }
      const xx = line.split(',')
      const roads = xx.reduce((acc, x) => {
        const v = x.split(':')
        const roadId = v[0]
        const numVehicles = v[1] || 0
        const road = {
          roadId,
          speed: 20,
          currentSignal: 1,
          numVehicles,
          vehicles: new Array(48).fill(0)
        }
        if (roadId) {
          acc.push(road)
        }
        return acc
      }, [])

      const data = {
        event: 'salt:data',
        simulationId: simulationId,
        roads
      }
      if (send) {
        send(simulationId, data)
      }
      await wait()
    }
  }
  function stop() {
    needToStop = true
    if (fileStream) {
      fileStream.close()
      rl.close()
    }
  }

  return {
    init, stop
  }
}

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer })

  const eventBus = Object.create(events.EventEmitter.prototype)

  // send message to all web clients
  const send = (simulationId, data) => {
    wss.clients.forEach((client) => {
      // @ts-ignore
      if (client.$simulationId === simulationId) {
        try {
          client.send(JSON.stringify(data))
        } catch (err) {
          debug(err.message)
        }
      }
    })
  }

  let replayer = Replayer(send)

  function handleReplayMessage(msg) {
    const tFile = path.join(config.saltPath.output, msg.simulationId, 'log.txt')

    if (msg.type === 'replay' && msg.command === 'start') {
      if (replayer) {
        replayer.stop()
        replayer = Replayer(send)
        replayer.init(msg.simulationId, tFile)
      }
    }
    if (msg.type === 'replay' && msg.command === 'stop') {
      if (replayer) {
        replayer.stop()
      }
    }
  }

  function handleConnection(client) {
    const msgHandler = MsgHandler(client, eventBus)

    client.on('message', (data) => {
      try {
        const msg = JSON.parse(data)
        const handler = msgHandler[msg.type] || (() => { })
        handler(msg)
        handleReplayMessage(msg)
      } catch (err) {
        debug(err.message)
      }
    })

    client.on('close', () => {
      console.log('--- SOCKET CLOSED ---')
      // replayer.stop()
    })

    client.on('error', () => {

    })
  }

  wss.on('connection', handleConnection)

  return Object.assign(eventBus, { send })
}
