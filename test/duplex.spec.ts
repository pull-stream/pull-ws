import { expect } from 'aegir/chai'
import WebSocket from '../src/web-socket.js'
import drain from 'it-drain'
import { pipe } from 'it-pipe'
import wsurl from './helpers/wsurl.js'
import * as WS from '../src/index.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import delay from 'delay'

const endpoint = wsurl + '/echo'

describe('duplex', () => {
  it('should close if already closed', async () => {
    const socket = new WebSocket(endpoint)
    const data = [
      uint8ArrayFromString('x'),
      uint8ArrayFromString('y'),
      uint8ArrayFromString('z')
    ]

    const duplex = WS.duplex(socket, { closeOnEnd: false })

    await pipe(
      data,
      duplex,
      drain
    )

    expect(duplex.socket.readyState).to.equal(WebSocket.CLOSED)

    await duplex.close()

    expect(duplex.socket.readyState).to.equal(WebSocket.CLOSED)
  })

  it('should close if connecting', async () => {
    const socket = new WebSocket(endpoint)
    const duplex = WS.duplex(socket, { closeOnEnd: false })

    expect(duplex.socket.readyState).to.equal(WebSocket.CONNECTING)

    await duplex.close()

    expect(duplex.socket.readyState).to.equal(WebSocket.CLOSED)
  })

  it('should close if open', async () => {
    const socket = new WebSocket(endpoint)
    const duplex = WS.duplex(socket, { closeOnEnd: false })

    while (true) {
      if (duplex.socket.readyState === WebSocket.OPEN) {
        break
      }

      await delay(100)
    }

    expect(duplex.socket.readyState).to.equal(WebSocket.OPEN)

    await duplex.close()

    expect(duplex.socket.readyState).to.equal(WebSocket.CLOSED)
  })
})
