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
const tmp = {}
const tmp2 = {}
module.exports = (httpServer, tcpPort) => {
  debug(chalk.yellow('Connector service start'))
  const tcpServer = startSlatMessageReceiver(tcpPort)
  const webSocketServer = startWebSocketServer(httpServer)

  // send to simulator
  webSocketServer.on(EVENT_SET, data => {
    tcpServer.send(data.simulationId, saltMsgFactory.makeSet(data))
  })

  webSocketServer.on(EVENT_STOP, data => {
    try {
      tcpServer.send(data.simulationId, saltMsgFactory.makeStop(data))
    } catch (err) {
      console.log(err)
    }
  })

  // const isFinished = ({ status, progress }) => status === StatusType.FINISHED && progress >= 95
  const isFinished = ({ status, progress }) => progress >= 95

  const epochCounterTable = {}

  tcpServer.on(EVENT_STATUS, async data => {
    const { simulationId } = data
    // debug(`${simulationId}: status: ${data.status}, progress: ${data.progress}`)
    webSocketServer.send(data.simulationId, { ...data })
    // tmp2[data.simulationId] = data.progress
    console.log(' ****************** progress:', data.progress)
    // if (obj) {
    //   obj.progress = data.progress
    // }

    // console.log(data)
    // console.log('------------------> SEND WEB Socket <----------------------')
    // console.log(data)
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
          debug('**** connector start cook ***', simulationId)
          await cookSimulationResult({
            simulationId,
            duration: configuration.end,
            period: configuration.period
          })
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

    //   const arr = tmp[data.simulationId] || []
    //   arr.push({
    //     simulationId: data.simulationId,
    //     data
    //   })
    //   tmp[data.simulationId] = arr
    // })

    // const consume = () => {
    //   const keys = Object.keys(tmp)
    //   for (let i = 0; i < keys.length; i++) {
    //     const d = tmp[keys[i]]
    //     if (d.length > 0) {
    //       const data = d.splice(0, 1)
    //       // console.log(data[0], d.length)
    //       webSocketServer.send(data[0].simulationId, { ...data[0].data })

    //       if (tmp2[data[0].simulationId]) {
    //         console.log('*****')
    //         console.log('*****')
    //         console.log('*****')
    //         console.log('*****')
    //         console.log('*****', tmp2[data[0].simulationId])
    //         webSocketServer.send(data[0].simulationId, {
    //           event: 'salt:status',
    //           simulationId: data[0].simulationId,
    //           status: 1,
    //           progress: tmp2[data[0].simulationId] || 0
    //         })
    //       }
    //     }
    //   }
    //   setTimeout(() => consume(), 20)
  })
  // consume()
}
