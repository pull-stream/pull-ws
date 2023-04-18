import { expect } from 'aegir/chai'
import * as WS from '../src/index.js'
import * as ndjson from 'it-ndjson'
import map from 'it-map'
import all from 'it-all'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode, isElectronMain } from 'wherearewe'

describe('simple echo server', () => {
  if (!(isNode || isElectronMain)) {
    return
  }

  it('echoes', async () => {
    const server = await WS.createServer({
      onConnection: (stream) => {
        void pipe(stream, stream)
      }
    }).listen({ port: 5678 })

    const ary = await pipe(
      [1, 2, 3],
      // need a delay, because otherwise ws hangs up wrong.
      // otherwise use pull-goodbye.
      (source) => map(source, async val => await new Promise(resolve => setTimeout(() => { resolve(val) }, 10))),
      (source) => map(ndjson.stringify(source), str => uint8ArrayFromString(str)),
      WS.connect('ws://localhost:5678'),
      ndjson.parse,
      all
    )

    expect(ary).to.deep.equal([1, 2, 3])
    await server.close()
  })
})
