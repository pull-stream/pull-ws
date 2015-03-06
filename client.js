var ws = require('pull-ws')
var WebSocket = require('ws')
var url = require('url')


function isFunction (f) {
  return 'function' === typeof f
}

exports.connect = function (addr, opts) {
  if(isFunction(opts)) {
    var cb = opts
    opts = {
      onOpen: function () {
        if(called) return
        called = true
        cb()
      },
      onClose: function (err) {
        if(called) return
        called = true
        cb(err)
      }
    }
  }
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

  if (opts && typeof opts.onOpen == 'function') {
    socket.on('open', opts.onOpen)
  }
  if (opts && typeof opts.onClose == 'function') {
    socket.on('close', opts.onClose)
  }

  stream.close = function (cb) {
    socket.close(cb)
  }

  return stream
}

