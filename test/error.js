var test = require('tape')
var WebSocket = require('ws')
const { pipeline, getIterator, consume } = require('streaming-iterables')
var ws = require('../')

var server = require('./server')()

// connect to a server that does not exist, and check that it errors.
// should pass the error to both sides of the stream.
test('test error', async function (t) {
  try {
    await pipeline(
      () => ['x', 'y', 'z'],
      // TODO: AS 2019-03-28 - is this actually what `pull` does? should this be
      // in a `pipeline` function?
      source => {
        const stream = ws(new WebSocket('ws://localhost:34897/' + Math.random()))

        const dSinkAbort = (async function * () {
          for await (const val of source) yield val
        })()

        const dSink = pipeline(() => dSinkAbort, stream.sink)

        dSink.catch(err => {
          if (dSource.throw) {
            return Promise.resolve(dSource.throw(err)).catch(_ => {})
          }
          throw err
        })

        const dSource = (async function * () {
          try {
            for await (const val of stream.source) yield val
          } catch (err) {
            if (dSinkAbort.throw) {
              await dSinkAbort.throw(err)
            }
            throw err
          }
        })()

        return dSource
      },
      consume
    )
  } catch (err) {
    t.ok(err)
    t.end()
  }
})

test('test error', async function (t) {
  try {
    await pipeline(
      () => ws(new WebSocket('ws://localhost:34897/' + Math.random())).source,
      consume
    )
  } catch (err) {
    t.ok(err.message.includes('ECONNREFUSED'))
    t.end()
  }
})

test('close', function (t) {
  server.close()
  t.end()
})
