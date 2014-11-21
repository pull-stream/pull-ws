var ws = require('pull-ws')
var WebSocket = require('ws')
var url = require('url')

exports.connect = function (addr, cb) {
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
  stream.socket = socket
  return stream
}

