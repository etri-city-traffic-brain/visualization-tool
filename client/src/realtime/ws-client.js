//    read from websocket and emit event

const serialize = obj => JSON.stringify(obj);

const { log } = console

function Client({ url = 'ws://localhost', simulationId, eventBus }) {

  if (!eventBus) {
    throw new Error('eventBus is null')
  }

  let status = 'ready'
  let socket = null

  const send = (obj) => socket.send(serialize(obj))
  const close = () => socket.close();

  function init() {
    if(status === 'open') {
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
      const roadType = zoom >= 19 ? 1 : 0 // 1: cell, 0: link
      const { min, max } = extent
      send({
        simulationId,
        type: 10, // Set
        extent:[ min.x, min.y, max.x, max.y],
        roadType
      })
    })
  }

  return {
    init,
    send,
    close
  }
}

export default Client
