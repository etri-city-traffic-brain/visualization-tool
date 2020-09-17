//    read from websocket and emit event

const serialize = obj => JSON.stringify(obj);
const deserialize = str => JSON.parse(str);

function Client(eventBus, simulationId) {

  if (!eventBus) {
    throw new Error('eventBus is null')
  }

  const socket = new WebSocket('ws://localhost:8082');

  const send = obj => socket.send(serialize(obj));
  const close = () => socket.close();

  // Connection opened
  socket.addEventListener('open', () => {
    send({
      type: 0,
      simulationId,
    });
  });

  // Listen for messages
  socket.addEventListener('message', (event) => {
    eventBus.$emit('salt:data', deserialize(event.data))
  });

  return {
    send,
    close
  }
}

export default Client
