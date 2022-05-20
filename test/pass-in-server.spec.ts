import { expect } from 'aegir/chai'
import * as WS from '../src/index.js'
import ndjson from 'it-ndjson'
import { pipe } from 'it-pipe'
import map from 'it-map'
import all from 'it-all'
import http from 'http'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode, isElectronMain } from 'wherearewe'
import type { WebSocketServer } from '../src/server.js'

describe('simple echo server', () => {
  if (!(isNode || isElectronMain)) {
    return
  }

  let httpServer: http.Server
  let server: WebSocketServer

  beforeEach(async () => {
    httpServer = http.createServer()
    server = WS.createServer({
      server: httpServer,
      onConnection: (stream) => {
        void pipe(stream, stream)
      }
    })

    await server.listen(5678)
  })

  afterEach(async () => {
    await server.close()
  })

  it('echoes', async () => {
    const stream = WS.connect('ws://localhost:5678')

    const ary = await pipe(
      [1, 2, 3],
      // need a delay, because otherwise ws hangs up wrong.
      // otherwise use pull-goodbye.
      (source) => map(source, async val => await new Promise(resolve => setTimeout(() => resolve(val), 10))),
      (source) => map(ndjson.stringify(source), str => uint8ArrayFromString(str)),
      stream,
      ndjson.parse,
      all
    )

    expect(ary).to.deep.equal([1, 2, 3])
  })
})
