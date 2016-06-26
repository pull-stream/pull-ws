'use strict';
var ws = require('pull-ws')
var WebSocket = require('ws')
var wsurl = require('./ws-url')

function isFunction (f) {
  return 'function' === typeof f
}

exports.connect = function (addr, opts) {
  var stream
  if(isFunction(opts)) opts = {onConnect: opts}

  var location = typeof window === 'undefined' ? {} : window.location

  var url = wsurl(addr, location)
  var socket = new WebSocket(url)
  stream = ws(socket, opts)
  stream.remoteAddress = url

  stream.close = function (cb) {
    if (cb && typeof cb == 'function')
      socket.addEventListener('close', cb)
    socket.close()
  }

  return stream
}







