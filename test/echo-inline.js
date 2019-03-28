var WS = require('../')
var tape = require('tape')
var ndjson = require('iterable-ndjson')
const { pipeline, map, collect } = require('streaming-iterables')

tape('simple echo server', async function (t) {
  var server = await WS.createServer(function (stream) {
    pipeline(() => stream.source, stream.sink)
  }).listen(5678)

  const ary = await pipeline(
    () => [1, 2, 3],
    // need a delay, because otherwise ws hangs up wrong.
    // otherwise use pull-goodbye.
    map(val => new Promise(resolve => setTimeout(() => resolve(val), 10))),
    ndjson.stringify,
    source => {
      const stream = WS.connect('ws://localhost:5678')
      stream.sink(source)
      return stream.source
    },
    ndjson.parse,
    collect
  )

  t.deepEqual(ary, [1, 2, 3])
  await server.close()
  t.end()
})
