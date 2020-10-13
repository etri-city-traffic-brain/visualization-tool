// const net = require('net');

// const { log } = console;

// const server = net.createServer({
//   allowHalfOpen: false,
//   pauseOnConnect: false,
// }, (serversideSocket) => {
//   log('socket connected');
//   serversideSocket.on('data', (data) => {
//     log(`got data of size ${data.length}`);
//   });
//   serversideSocket.on('end', () => {
//     console.log('client disconnected, closing');
//     server.close();
//   });
// }).listen(1339, '127.0.0.1', () => {
//   log('server listening');
//   const clientsideSocket = net.createConnection({
//     port: 1339,
//     host: '127.0.0.1',
//     allowHalfOpen: false,
//   });
//   // const sendBuffer = Buffer.allocUnsafe(1048576);
//   const sendBuffer = Buffer.allocUnsafe(65538);
//   clientsideSocket.write(sendBuffer);
//   clientsideSocket.end();
// });
