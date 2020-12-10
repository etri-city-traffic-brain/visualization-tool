//    read from websocket and emit event

const serialize = obj => JSON.stringify(obj);

const { log } = console

// eslint-disable-next-line no-undef
const env = process && process.env

let wsUrl = env.NODE_ENV === 'development' ? 'ws://127.0.0.1:8080' : 'ws://101.79.1.114:8080/'

log('execution mode:', env.NODE_ENV)

function Client({ url = wsUrl, simulationId, eventBus }) {

  if (!eventBus) {
    throw new Error('eventBus is null')
  }

  let status = 'ready'
  let socket = null

  const send = (obj) => {
    try {
      socket.send(serialize(obj))
    } catch (err) {
      console.log(err.message)
    }
  }
  const close = () => socket.close();

  function init() {
    log('web-socket init:', simulationId, wsUrl)
    if(status === 'open') {
      log('WebSocket is already opened!!')
      return
    }
    socket = new WebSocket(url);
    socket.addEventListener('open', () => {
      send({ type: 0, simulationId });
      status = 'open'
      eventBus.$emit('ws:open')
    });

    socket.addEventListener('message', ({ data }) => {
      try {
        const event =  JSON.parse(data)
        eventBus.$emit(event.event, event)
      } catch (err) {
        log.error(err)
      }
    });

    socket.addEventListener('close', () => {
      eventBus.$emit('ws:close', {})
      status = 'close'
    })

    socket.addEventListener('error', () => {
      eventBus.$emit('ws:error',new Error(`WebSocket connection to ${url} failed`))
      status = 'error'
    })

    eventBus.$on('salt:set', ({extent, zoom}) => {
      const roadType = zoom >= 18 ? 1 : 0 // 1: cell, 0: link
      const { min, max } = extent
console.log('send salt:set')
      min.x -= 0.0012;
      min.y -= 0.0014;
      max.x += 0.0012;
      max.y += 0.0014;

      send({
        simulationId,
        type: 10, // Set
        extent:[min.x, max.y, max.x, min.y],
        roadType
      })
    })

    eventBus.$on('salt:stop', (sId) => {

      if(simulationId === sId) {
        send({
          simulationId,
          type: 11, // Set
        })
      } else {
        console.log('igno')
      }
    })
  }

  init()
  return {
    init,
    send,
    close
  }
}

export default Client
