const net = require('net');
const msgFactory = require('../msg-factory');
const { MAX_ROAD_ID_LENGTH, MAX_SIMULATION_ID_LENGTH } = require('../msg');

const { log } = console;

const socket = net.connect({ port: 1337, host: '1.245.47.108' });

const simulationId = 'SALT_202009_00940';

const send = (buffer) => socket.write(buffer);

const str2CharCodes = str => str.split('').map(d => d.charCodeAt());

const sleep = sec => new Promise((resolve) => setTimeout(() => resolve(), sec))

const connect = async () => {
  const init = msgFactory.makeInit({
    simulationId: str2CharCodes(simulationId),
  });


  send(init);
  await sleep(500)

  for(let i = 0; i <= 10; i++) {
    send(msgFactory.makeStatus({ status: 0, progress: i * 10 }))
    await sleep(1000)
  }



  setTimeout(()=>{
    socket.destroy()
  }, 2000)
}

socket.on('connect', connect);
