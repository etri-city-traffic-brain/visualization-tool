
const encode = require('./encode-struct')
const { Header } = require('./salt-msg')

function encodeMsg (Struct, bodyObj) {
  const bodyBuffer = encode(Struct, bodyObj)
  const headerBuffer = encode(Header, {
    type: Struct.type,
    timestamp: new Date().getTime(),
    length: bodyBuffer.length
  })
  return Buffer.concat([headerBuffer, bodyBuffer])
}

module.exports = encodeMsg
