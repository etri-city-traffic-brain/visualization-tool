//    read from websocket and emit event

const serialize = obj => JSON.stringify(obj);
const deserialize = str => JSON.parse(str);

const { log } = console

function Client({simulationId, eventBus}) {

  if (!eventBus) {
    throw new Error('eventBus is null')
  }
  const url = 'ws://localhost'
  let status = 'ready'
  let socket = null

  function send(obj) {
    socket.send(serialize(obj));
  }

  const close = () => socket.close();

  function init() {
    if(status === 'open') {
      return
    }
    socket = new WebSocket(url);
    socket.addEventListener('open', () => {
      send({
        type: 0,
        simulationId,
      });
      status = 'open'
      eventBus.$emit('ws:open')
    });

    socket.addEventListener('message', (event) => {
      eventBus.$emit('salt:data', deserialize(event.data))
      log(deserialize(event.data))
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
      log(this)
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
