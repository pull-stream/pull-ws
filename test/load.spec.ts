import { pipe } from 'it-pipe'
import each from 'it-foreach'
import drain from 'it-drain'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode, isElectronMain } from 'wherearewe'
import * as WS from '../src/index.js'

describe('load', () => {
  if (!(isNode || isElectronMain)) {
    return
  }

  it('should handle load', async () => {
    // const start = Date.now()

    const server = await WS.createServer({
      onConnection: async function (stream) {
        let N = 0
        await pipe(
          stream.source,
          (source) => each(source, val => {
            if (N % 1000 === 0) {
              // console.log(N) // eslint-disable-line no-console
            }
            N++
          }),
          drain
        )
        // console.log(N, N / ((Date.now() - start) / 1000)) // eslint-disable-line no-console
        await server.close()
      }
    }).listen(2134)

    await pipe(
      Array.from(Array(10000), (_, i) => i).map(() => uint8ArrayFromString('?')),
      WS.connect('ws://localhost:2134').sink
    )
  })
})
