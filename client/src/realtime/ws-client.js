//    read from websocket and emit event

const serialize = obj => JSON.stringify(obj)

const { log } = console
const { WebSocket } = window

// eslint-disable-next-line no-undef
const env = process && process.env
if (env) {
  log(`Mode: %c${env.NODE_ENV}`, 'color: red')
}
// const wsUrl = env.NODE_ENV === 'development' ? 'ws://101.79.1.124:8080' : 'ws://101.79.1.124:8080/'
const wsUrl =
  env.NODE_ENV === 'development'
    ? 'ws://127.0.0.1:8080'
    : 'ws://101.79.1.124:8080/'
// const wsUrl = env.NODE_ENV === 'development' ? 'ws://127.0.0.1:8080' : 'ws://101.79.1.117:8080/'

log(`Web Socket Address: ${wsUrl}`)

const extend = extent => {
  const { min, max } = extent
  return {
    min: {
      x: min.x - 0.0012,
      y: min.y - 0.0014
    },
    max: {
      x: max.x + 0.0012,
      y: max.y + 0.0014
    }
  }
}
let killed = false
function Client ({ url = wsUrl, simulationId, eventBus }) {
  if (!eventBus) {
    throw new Error('eventBus is null')
  }

  let status = 'ready'
  let socket = null

  const send = obj => {
    try {
      socket.send(serialize(obj))
    } catch (err) {
      log(err.message)
    }
  }
  const close = () => {
    if (socket) {
      socket.close()
    }
  }
  const kill = () => {
    killed = true
    status = 'close'
    close()
  }
  const restart = () => {
    killed = false
    init()
  }
  function init (slaves) {
    // log(`init ${simulationId} - ${wsUrl}`)
    if (status === 'open') {
      log('WebSocket is already opened!!')
      return
    }
    try {
      socket = new WebSocket(url)
    } catch (err) {
      log(err.message)
      return
    }
    socket.addEventListener('open', () => {
      send({ type: 0, simulationId })
      status = 'open'
      eventBus.$emit('ws:open')
    })

    socket.addEventListener('message', ({ data }) => {
      // console.log('message', data)
      try {
        const event = JSON.parse(data)
        eventBus.$emit(event.event, event)
      } catch (err) {
        log.error(err)
      }
    })

    socket.addEventListener('close', () => {
      eventBus.$emit('ws:close', {})
      status = 'close'
      if (killed) {
        return
      }
      setTimeout(() => init(), 1000)
    })

    socket.addEventListener('error', () => {
      eventBus.$emit(
        'ws:error',
        new Error(`WebSocket connection to ${url} failed`)
      )
      status = 'error'
    })

    eventBus.$on('salt:set', ({ simulationId, extent }) => {
      if (slaves) {
        setBoundingBox(slaves[0], extent)
        setBoundingBox(slaves[1], extent)
        return
      }
      setBoundingBox(simulationId, extent)
    })

    eventBus.$on('salt:stop', sId => {
      if (simulationId === sId) {
        send({
          simulationId,
          type: 11 // Stop
        })
      }
    })
  }

  // 시뮬레이터로 BBox 설정을 요청한다.
  function setBoundingBox (simulationId, extent) {
    const { min, max } = extend(extent)
    send({
      simulationId,
      type: 10, // Set(10)
      extent: [min.x, max.y, max.x, min.y],
      roadType: 1 // Cell(1), Link(0)
    })
  }

  return {
    init,
    send,
    close,
    kill,
    restart,
    setBoundingBox
  }
}

export default Client
