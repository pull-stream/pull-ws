'use strict';
var ws = require('pull-ws')
var WebSocket = require('ws')
var wsurl = require('./ws-url')

function isFunction (f) {
  return 'function' === typeof f
}

exports.connect = function (addr, opts) {
  var stream
  if(isFunction(opts)) {
    var cb = opts
    var called = false
    opts = {
      onOpen: function () {
        if(called) return
        called = true
        cb(null, stream)
      },
      onClose: function (err) {
        if(called) return
        called = true
        cb(err)
      }
    }
  }

  var url = wsurl(addr, window.location)
  var socket = new WebSocket(url)
  stream = ws(socket)
  stream.remoteAddress = url

  if (opts && typeof opts.onOpen == 'function') {
    socket.addEventListener('open', opts.onOpen)
  }
  if (opts && typeof opts.onClose == 'function') {
    socket.addEventListener('close', opts.onClose)
  }

  stream.close = function (cb) {
    if (cb && typeof cb == 'function')
      socket.addEventListener('close', cb)
    socket.close()
  }

  return stream
}



