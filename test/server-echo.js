var WS = require('../')
var tape = require('tape')
const ndjson = require('iterable-ndjson')
const { pipeline, map, collect } = require('streaming-iterables')

tape('simple echo server', async t => {
  const server = WS.createServer(async stream => {
    await pipeline(() => stream.source, stream.sink)
  })

  await server.listen(5678)

  const stream = WS.connect('ws://localhost:5678')

  const ary = await pipeline(
    () => [1, 2, 3],
    // need a delay, because otherwise ws hangs up wrong.
    // otherwise use pull-goodbye.
    map(val => new Promise(resolve => setTimeout(() => resolve(val), 10))),
    ndjson.stringify,
    source => {
      stream.sink(source)
      return stream.source
    },
    ndjson.parse,
    collect
  )

  await server.close()

  t.deepEqual(ary, [1, 2, 3])
  t.end()
})
