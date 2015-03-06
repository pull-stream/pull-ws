var ws = require('pull-ws')
var WebSocket = require('ws')
var url = require('url')

exports.connect = function (addr, opts) {
  var u = (
    'string' === typeof addr
  ? addr
  : url.format({
      protocol: 'ws', slashes: true,
      hostname: addr.host || addr.hostname,
      port: addr.port,
      pathname: addr.pathname
    })
  )

  var socket = new WebSocket(u)
  var stream = ws(socket)
  stream.remoteAddress = u

  if (opts && typeof opts.onopen == 'function') {
    socket.on('open', opts.onopen)
  }
  if (opts && typeof opts.onclose == 'function') {
    socket.on('close', opts.onclose)
  }

  return stream
}

