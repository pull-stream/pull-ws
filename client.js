'use strict';

//load websocket library if we are not in the browser
var WebSocket = require('./web-socket')
var duplex = require('./duplex')
var wsurl = require('./ws-url')

function isFunction (f) {
  return 'function' === typeof f
}

module.exports = function (addr, opts) {
  var stream
  if(isFunction(opts)) opts = {onConnect: opts}

  var location = typeof window === 'undefined' ? {} : window.location

  var url = wsurl(addr, location)
  var socket = new WebSocket(url)
  stream = duplex(socket, opts)
  stream.remoteAddress = url

  stream.close = function (cb) {
    if (cb && typeof cb == 'function')
      socket.addEventListener('close', cb)
    socket.close()
  }

  return stream
}

module.exports.connect = module.exports
