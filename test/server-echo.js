var WS = require('../')
var tape = require('tape')
const ndjson = require('iterable-ndjson')
const { pipeline, collect } = require('streaming-iterables')

tape('simple echo server', async t => {
  const server = WS.createServer(async stream => {
    await pipeline(
      () => stream[Symbol.asyncIterator](),
      stream
    )
  })

  await server.listen(5678)

  const stream = await WS.connect('ws://localhost:5678')

  const ary = await pipeline(
    () => [1, 2, 3],
    // need a delay, because otherwise ws hangs up wrong.
    // otherwise use pull-goodbye.
    source => (async function * () {
      for await (const val of source) {
        yield new Promise(resolve => setTimeout(() => resolve(val), 10))
      }
    })(),
    ndjson.stringify,
    source => {
      stream(source)
      return stream[Symbol.asyncIterator]()
    },
    ndjson.parse,
    collect
  )

  await server.close()

  t.deepEqual(ary, [1, 2, 3])
  t.end()
})
