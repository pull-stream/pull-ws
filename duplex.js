const source = require('./source')
const sink = require('./sink')

module.exports = (socket, options) => {
  options = options || {}
  const req = socket.upgradeReq || {}

  if (options.binaryType) {
    socket.binaryType = options.binaryType
  } else if (options.binary) {
    socket.binaryType = 'arraybuffer'
  }

  return {
    sink: sink(socket, options),
    source: source(socket, options),
    // http properties - useful for routing or auth.
    headers: req.headers,
    url: req.url,
    upgrade: req.upgrade,
    method: req.method
  }
}
