
module.exports = () => {
  const bufferBySocket = {}

  return {
    addBuffer (socket, buffer) {
      bufferBySocket[socket] = Buffer.concat([
        bufferBySocket[socket] || Buffer.alloc(0),
        buffer
      ])
    },

    getBuffer (socket) {
      return bufferBySocket[socket] || Buffer.alloc(0)
    },

    setBuffer (socket, buffer) {
      bufferBySocket[socket] = buffer
    },

    deleteBuffer (socket) {
      delete bufferBySocket[socket]
    }
  }
}
