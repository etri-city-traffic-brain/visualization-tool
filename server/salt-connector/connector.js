const debug = require('debug')('salt-connector:connector')
const chalk = require('chalk')

const cookSimulationResult = require('../main/simulation-manager/cook')
const { getSimulation, updateStatus } = require('../globals')

const startWebSocketServer = require('./ws-server')
const startSlatMessageReceiver = require('./tcp-server')
const saltMsgFactory = require('./salt-msg-factory')

const readReward = require('../main/signal-optimization/read-reward')

const { StatusType } = require('./salt-msg-type')

const {
  EVENT_SET,
  EVENT_STOP,
  EVENT_STATUS,
  EVENT_DATA,
  EVENT_FINISHED
} = require('./event-types')

const OPTIMIZATION = {
  TRAINING: 'training'
}

/**
 * SALT connector server
 * connect simulator and web browser
 *
 * @param {Object} param
 * @param {number} param.tcpPort
 */

module.exports = (httpServer, tcpPort) => {
  const tcpServer = startSlatMessageReceiver(tcpPort)
  const webSocketServer = startWebSocketServer(httpServer)

  // send to simulator
  webSocketServer.on(EVENT_SET, data => {
    tcpServer.send(data.simulationId, saltMsgFactory.makeSet(data))
    // console.log('**** send set to', data.simulationId)
    // console.log('**** send set to', data)
  })

  webSocketServer.on(EVENT_STOP, data => {
    try {
      tcpServer.send(data.simulationId, saltMsgFactory.makeStop(data))
    } catch (err) {
      console.log(err)
    }
  })

  // const isFinished = ({ status, progress }) => status === StatusType.FINISHED && progress >= 95
  const isFinished = ({ status, progress }) => progress >= 100

  const epochCounterTable = {}

  tcpServer.on(EVENT_STATUS, async data => {
    const { simulationId } = data
    debug(`${simulationId}: status: ${data.status}, progress: ${data.progress}`)
    webSocketServer.send(data.simulationId, { ...data })

    if (isFinished(data)) {
      debug('*** SIMULATION FINISHED ***')
      // webSocketServer.send(simulationId, {
      //   event: EVENT_FINISHED
      // })
      const simulation = getSimulation(simulationId)
      if (!simulation) {
        debug('cannot find simulation', simulationId)
        return
      }

      const { configuration, role } = simulation
      if (role === OPTIMIZATION.TRAINING) {
        const epochCounter = epochCounterTable[simulationId] || { count: 0 }
        epochCounterTable[simulationId] = epochCounter
        epochCounter.count += 1
        updateStatus(simulationId, 'running', { epoch: epochCounter.count })
        if (epochCounter.count >= +simulation.configuration.epoch) {
          debug(epochCounter.count, simulation.epoch)
          debug('*** OPTIMIZATION FINISHED ***')
          // updateStatus(simulationId, 'finished', { epoch: 0 })
          delete epochCounterTable[simulationId]

          setTimeout(async () => {
            webSocketServer.send(simulationId, {
              event: 'optimization:finished'
            })
          }, 2000)
        }

        webSocketServer.send(simulationId, {
          event: 'optimization:progress',
          progress: epochCounter.count
        })
        setTimeout(async () => {
          const data = await readReward(simulationId)
          webSocketServer.send(simulationId, {
            event: 'optimization:epoch',
            data,
            progress: epochCounter.count
          })
        }, 3000)
      } else {
        try {
          // moved to exec-simulation.js 0909
          debug(`start analyze simulation result [${simulationId}]`)
          await cookSimulationResult({
            simulationId,
            duration: configuration.end - configuration.begin,
            period: configuration.period
          })
          debug(`end analyze simulation result [${simulationId}]`)
          // updateStatus(simulationId, 'finished')
          webSocketServer.send(simulationId, {
            event: EVENT_FINISHED
          })
        } catch (err) {
          debug(err.message)
        }
      }
    }
  })

  // send to web
  tcpServer.on(EVENT_DATA, data => {
    // console.log(data.simulationId)
    webSocketServer.send(data.simulationId, { ...data })
  })
}
