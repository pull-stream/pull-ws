const { pipeline, map, tap, consume } = require('streaming-iterables')

var WS = require('../')

async function main () {
  var start = Date.now()

  var server = await WS.createServer(async function (stream) {
    var N = 0
    await pipeline(
      () => stream.source,
      tap(val => {
        if (!(N % 1000)) console.log(N)
        N++
      }),
      consume
    )
    console.log(N, N / ((Date.now() - start) / 1000))
    server.close()
  }).listen(2134)

  pipeline(
    () => Array.from(Array(10000), (_, i) => i),
    map(n => '?'),
    WS.connect('ws://localhost:2134').sink
  )
}

main()
