const source = require('./source')
const sink = require('./sink')

module.exports = (socket, options) => {
  options = options || {}

  if (options.binaryType) {
    socket.binaryType = options.binaryType
  } else if (options.binary) {
    socket.binaryType = 'arraybuffer'
  }

  return {
    sink: sink(socket, options),
    source: source(socket, options)
  }
}
