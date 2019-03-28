var test = require('tape')
var WebSocket = require('ws')
const { pipeline, tap, consume } = require('streaming-iterables')
var endpoint = require('./helpers/wsurl') + '/echo'
var ws = require('..')

var server = require('./server')()

test('websocket closed when pull source input ends', function (t) {
  var socket = new WebSocket(endpoint)

  pipeline(() => ws.source(socket), consume).then(() => {
    t.end()
  })

  pipeline(
    () => ['x', 'y', 'z'],
    ws.sink(socket, { closeOnEnd: true })
  )
})

test('closeOnEnd=false, stream doesn\'t close', function (t) {
  var socket = new WebSocket(endpoint)

  t.plan(3)
  pipeline(
    () => ws.source(socket),
    tap(function (item) {
      t.ok(item)
    }),
    consume
  )

  pipeline(
    () => ['x', 'y', 'z'],
    ws.sink(socket, { closeOnEnd: false })
  )
})

test('close', function (t) {
  server.close()
  t.end()
})
