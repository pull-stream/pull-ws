var test = require('tape')
var WebSocket = require('ws')
var ws = require('..')
var url = require('./helpers/wsurl') + '/echo'
const { pipeline, tap, consume } = require('streaming-iterables')

var server = require('./server')()

test('setup echo reading and writing', function (t) {
  var socket = new WebSocket(url)
  var expected = ['x', 'y', 'z']

  t.plan(expected.length)

  pipeline(
    () => ws.source(socket),
    tap(function (value) {
      console.log(value)
      t.equal(value, expected.shift())
    }),
    consume
  )

  pipeline(
    () => [].concat(expected),
    ws.sink(socket, { closeOnEnd: false })
  )
})

test('duplex style', function (t) {
  var expected = ['x', 'y', 'z']
  var socket = new WebSocket(url)

  t.plan(expected.length)

  pipeline(
    () => [].concat(expected),
    source => {
      const stream = ws(socket, { closeOnEnd: false })
      stream.sink(source)
      return stream.source
    },
    tap(function (value) {
      console.log('echo:', value)
      t.equal(value, expected.shift())
    }),
    consume
  )
})

test.skip('duplex with goodbye handshake', function (t) {
  var expected = ['x', 'y', 'z']
  var socket = new WebSocket(url)

  var pws = ws(socket)

  pipeline(
    () => getIterator(pws),
    goodbye({
      source: pull.values([].concat(expected)),
      sink: pull.drain(function(value) {
        t.equal(value, expected.shift())
      }, function (err) {
        t.equal(expected.length, 0)
        t.end()
      })
    }),
    pws
  )
})

test('close', function (t) {
  server.close()
  t.end()
})
