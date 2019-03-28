const { Buffer } = require('safe-buffer')
const { EventIterator } = require('event-iterator')

// copied from github.com/feross/buffer
// Some ArrayBuffers are not passing the instanceof check, so we need to do a bit more work :(
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

module.exports = socket => {
  return (async function * () {
    const messages = new EventIterator(
      (push, stop, fail) => {
        socket.addEventListener('message', push)
        socket.addEventListener('error', fail)
        socket.addEventListener('close', stop)
      },
      (push, stop, fail) => {
        const remove = socket.removeEventListener || socket.removeListener
        remove.call(socket, 'message', push)
        remove.call(socket, 'error', fail)
        remove.call(socket, 'close', stop)
      },
      { highWaterMark: Infinity }
    )

    for await (let { data } of messages) {
      yield isArrayBuffer(data) ? Buffer.from(data) : data
    }
  })()
}
