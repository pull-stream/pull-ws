var ws = require('pull-ws')
var WebSocket = require('ws')
var url = require('url')
var http = require('http')
var https = require('https')

exports.connect = require('./client').connect

var EventEmitter = require('events').EventEmitter

exports.createServer = function (opts, onConnection) {
  var emitter = new EventEmitter()
  var server
  if (typeof opts === 'function'){
    onConnection = opts
    opts = null
  }
  opts = opts || {}

  if(onConnection)
    emitter.on('connection', onConnection)

  function proxy (server, event) {
    return server.on(event, function () {
      var args = [].slice.call(arguments)
      args.unshift(event)
      emitter.emit.apply(emitter, args)
    })
  }
 
  var server =
    opts.key && opts.cert ? https.createServer(opts) : http.createServer()
  var wsServer = new WebSocket.Server({
    server: server,
    verifyClient: opts.verifyClient
  })

  emitter.listen = function (addr, onListening) {
    proxy(server, 'listening')
    proxy(server, 'request')
    proxy(server, 'close')

    wsServer.on('connection', function (socket) {
      var stream = ws(socket)
      stream.remoteAddress = socket.upgradeReq.socket.remoteAddress
      emitter.emit('connection', stream)
    })

    if(onListening)
      emitter.once('listening', onListening)
    server.listen(addr.port || addr)
    return emitter
  }

  emitter.close = function (onClose) {
    server.close(onClose)
    wsServer.close()
    return emitter
  }
  return emitter
}


