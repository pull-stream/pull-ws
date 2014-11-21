var ws = require('pull-ws')
var WebSocket = require('ws')
var url = require('url')
var http = require('http')

exports.connect = function (addr) {
  var u = url.format({
    protocol: 'ws', slashes: true,
    hostname: addr.host,
    port: addr.port
  })
  var socket = new WebSocket(u)
  var stream = ws(socket)
  stream.socket = socket
  return stream
}

var EventEmitter = require('events').EventEmitter

exports.createServer = function (onConnection) {
  var emitter = new EventEmitter()
  var server
  if(onConnection)
    emitter.on('connection', onConnection)

  function proxy (server, event) {
    return server.on(event, function () {
      var args = [].slice.call(arguments)
      args.unshift(event)
      emitter.emit.apply(emitter, args)
    })
  }

  var server = http.createServer()

  var wsServer = new WebSocket.Server({server:server})
  proxy(server, 'listening')
  proxy(server, 'request')
  proxy(server, 'close')

  wsServer.on('connection', function (socket) {
      emitter.emit('connection', ws(socket))
    })

  emitter.listen = function (addr, onListening) {
    if(onListening)
      emitter.once('listening', onListening)
    server.listen(addr.port || addr)
    return emitter
  }

  emitter.close = function (onClose) {
    if(!server) return onClose()
    server.close(onClose)
    return emitter
  }
  return emitter
}

