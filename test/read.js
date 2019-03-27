var test = require('tape')
var WebSocket = require('ws')
const { pipeline, collect } = require('streaming-iterables')
var endpoint = require('./helpers/wsurl') + '/read'
var ws = require('../source')
var socket

var server = require('./server')()

test('create a websocket connection to the server', function (t) {
  t.plan(1)

  socket = new WebSocket(endpoint)
  socket.onopen = t.pass.bind(t, 'socket ready')
})

test('read values from the socket and end normally', async function (t) {
  t.plan(1)

  const values = await pipeline(
    () => ws(socket),
    collect
  )

  t.deepEqual(values, ['a', 'b', 'c', 'd'])
})

test('read values from a new socket and end normally', async function (t) {
  t.plan(1)

  const values = await pipeline(
    () => ws(new WebSocket(endpoint)),
    collect
  )

  t.deepEqual(values, ['a', 'b', 'c', 'd'])
})

test('close', function (t) {
  server.close()
  t.end()
})
