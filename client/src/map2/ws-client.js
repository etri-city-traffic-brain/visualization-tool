//    read from websocket and emit event

const serialize = obj => JSON.stringify(obj);
const deserialize = str => JSON.parse(str);

function Client(eventBus, simulationId) {

  if (!eventBus) {
    throw new Error('eventBus is null')
  }
  const url = 'ws://localhost:8082'
  let status = 'ready'
  let socket = null

  const send = obj => socket.send(serialize(obj));
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
    });
    socket.addEventListener('close', () => {
      eventBus.$emit('ws:close', {})
      status = 'close'
    })
    socket.addEventListener('error', () => {
      eventBus.$emit('ws:error',new Error(`WebSocket connection to ${url} failed`))
      status = 'error'
    })
  }

  return {
    init,
    send,
    close
  }
}

export default Client
