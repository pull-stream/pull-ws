import { expect } from 'aegir/utils/chai.js'
import * as WS from '../src/index.js'
import ndjson from 'it-ndjson'
import { pipe } from 'it-pipe'
import map from 'it-map'
import all from 'it-all'
import each from 'it-foreach'
import delay from 'delay'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode, isElectronMain } from 'wherearewe'

describe('simple echo server', () => {
  if (!(isNode || isElectronMain)) {
    return
  }

  it('echoes', async () => {
    const server = WS.createServer({
      onConnection: async stream => {
        await pipe(stream, stream)
      }
    })

    await server.listen(5678)

    const stream = WS.connect('ws://localhost:5678')

    const ary = await pipe(
      [1, 2, 3],
      // need a delay, because otherwise ws hangs up wrong.
      // otherwise use pull-goodbye.
      (source) => each(source, async () => await delay(10)),
      (source) => map(ndjson.stringify(source), str => uint8ArrayFromString(str)),
      stream,
      ndjson.parse,
      all
    )

    await server.close()

    expect(ary).to.deep.equal([1, 2, 3])
  })
})
