const debug = require('debug')('salt-connector:msg-handler')

const msgFactory = require('./salt-msg-factory')
const { EventEmitter } = require('events')
const chalk = require('chalk')
const { Init, Data, Status } = require('./salt-msg')
const { INIT, DATA, STATUS } = require('./salt-msg-type').MsgType
const { EVENT_DATA, EVENT_STATUS } = require('./event-types')

const config = require('../config')
const path = require('path')
const fs = require('fs')

const hex = require('./utils/hex')
const LOG_FILE = 'log.txt'
/**
 *
 * @param {function} getQueue queue manager's function
 */
function SaltMsgHandler () {
  const socketToSimulationId = {}
  const simulationIdToSocket = {}
  const eventBus = Object.create(EventEmitter.prototype)

  const send = (simulationId, buffer) => {
    const socket = simulationIdToSocket[simulationId]
    if (socket) {
      socket.write(buffer)
    } else {
      // console.log('*** no socket ***', simulationId)
    }
  }

  //   INIT
  const handleSaltInit = (socket, buffer) => {
    try {
      const initMsg = Init(buffer)
      const simulationId = initMsg.simulationId

      if (!(simulationId.startsWith('S') || simulationId.startsWith('O'))) {
        console.log(simulationId)
        console.log('--- 의심 ---')
        return
      }
      // if (!socketToSimulationId[socket.remotePort]) {
      socketToSimulationId[socket.remotePort] = simulationId
      simulationIdToSocket[simulationId] = socket
      console.log('add socket', socket.remotePort, simulationId)
      // }
      debug(`[INIT] ${simulationId}, ${socket.remotePort}`)

      if (buffer.length > 100) {
        handleSaltData(socket, buffer)
      }
      // console.log(initMsg)
      if (simulationId.startsWith('SIM')) {
        fs.writeFileSync(
          path.join(config.saltPath.output, simulationId, LOG_FILE),
          ''
        )
      }
      const setBuffer = msgFactory.makeSet({
        // extent: [127.33342, 36.3517, 127.34806, 36.34478], // max.y 가 min.y 보다 작아야 함
        extent: [127.3373, 36.34837, 127.34303, 36.34303 - 0.0005], // max.y 가 min.y 보다 작아야 함], // max.y 가 min.y 보다 작아야 함
        roadType: 1
      })

      send(simulationId, setBuffer)
    } catch (err) {
      debug(err.message)
    }
  }

  //  DATA
  const handleSaltData = (socket, buffer) => {
    // console.log(hex(buffer))
    // console.log(buffer.length)

    try {
      const data = Data(buffer)

      const simulationId = socketToSimulationId[socket.remotePort]
      eventBus.emit(EVENT_DATA, {
        event: EVENT_DATA,
        simulationId,
        ...data
      })

      if (simulationId.startsWith('SIM')) {
        const logFile = path.join(
          config.saltPath.output,
          simulationId,
          LOG_FILE
        )

        const line = data.roads.reduce((acc, cur) => {
          const result = acc + cur.roadId + ':' + cur.numVehicles + ','
          return result
        }, '')

        fs.appendFile(logFile, line + '\n', function (err) {
          if (err) throw err
        })
      }

      // fs.access(logFile, fs.F_OK, (err) => {
      //   if (err) {
      //     console.error(err)
      //     return
      //   }
      //   fs.appendFile(logFile, line + '\n', function (err) {
      //     if (err) throw err
      //   })
      // })
    } catch (err) {
      console.log(err.message)
      // console.log(hex(buffer))
      // console.log(buffer.length)
    }
  }

  //  STATUS
  const handleSaltStatus = (socket, buffer) => {
    const status = Status(buffer)
    const simulationId = socketToSimulationId[socket.remotePort]
    // console.log(simulationId)
    eventBus.emit(EVENT_STATUS, {
      event: EVENT_STATUS,
      simulationId,
      ...status
    })
  }

  const handlers = {
    [INIT]: handleSaltInit,
    [DATA]: handleSaltData,
    [STATUS]: handleSaltStatus
  }

  const clearResource = socket => {
    delete simulationIdToSocket[socketToSimulationId[socket.remotePort]]
    delete socketToSimulationId[socket.remotePort]
  }

  return Object.assign(eventBus, {
    get (type) {
      return handlers[type]
    },
    clearResource,
    send
  })
}

module.exports = SaltMsgHandler
