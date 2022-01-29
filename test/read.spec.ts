import { expect } from 'aegir/utils/chai.js'
import WebSocket from '../src/web-socket.js'
import { pipe } from 'it-pipe'
import all from 'it-all'
import * as WS from '../src/index.js'
import wsurl from './helpers/wsurl.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const endpoint = wsurl + '/read'

describe('read', () => {
  let socket: WebSocket

  beforeEach(async () => {
    socket = new WebSocket(endpoint)
  })

  afterEach(async () => {
    socket.close()
  })

  it('read values from the socket and end normally', async function () {
    const values = await pipe(
      WS.duplex(socket),
      async (source) => await all(source)
    )

    expect(values.map((arr: Uint8Array) => uint8ArrayToString(arr))).to.deep.equal(['a', 'b', 'c', 'd'])
  })

  it('read values from a new socket and end normally', async function () {
    const values = await pipe(
      WS.duplex(new WebSocket(endpoint)),
      async (source) => await all(source)
    )

    expect(values.map((arr: Uint8Array) => uint8ArrayToString(arr))).to.deep.equal(['a', 'b', 'c', 'd'])
  })
})
