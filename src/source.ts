
import { EventIterator } from 'event-iterator'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { WebSocket, ErrorEvent, MessageEvent } from 'ws'

// copied from github.com/feross/buffer
// Some ArrayBuffers are not passing the instanceof check, so we need to do a bit more work :(
function isArrayBuffer (obj: any): obj is ArrayBuffer {
  return (obj instanceof ArrayBuffer) ||
    (obj?.constructor?.name === 'ArrayBuffer' && typeof obj?.byteLength === 'number')
}

export interface ConnectedSource extends AsyncIterable<Uint8Array> {
  connected: () => Promise<void>
}

export default (socket: WebSocket): ConnectedSource => {
  socket.binaryType = 'arraybuffer'

  const connected = async () => await new Promise<void>((resolve, reject) => {
    if (isConnected) {
      return resolve()
    }
    if (connError != null) {
      return reject(connError)
    }

    const cleanUp = (cont: () => void) => {
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('error', onError)
      cont()
    }

    const onOpen = () => cleanUp(resolve)
    const onError = (event: ErrorEvent) => {
      cleanUp(() => reject(event.error ?? new Error(`connect ECONNREFUSED ${socket.url}`)))
    }

    socket.addEventListener('open', onOpen)
    socket.addEventListener('error', onError)
  })

  const source = (async function * () {
    const messages = new EventIterator<Uint8Array>(
      ({ push, stop, fail }) => {
        const onMessage = (event: MessageEvent) => {
          let data: Uint8Array | null = null

          if (typeof event.data === 'string') {
            data = uint8ArrayFromString(event.data)
          }

          if (isArrayBuffer(event.data)) {
            data = new Uint8Array(event.data)
          }

          if (event.data instanceof Uint8Array) {
            data = event.data
          }

          if (data == null) {
            return
          }

          push(data)
        }
        const onError = (event: ErrorEvent) => fail(event.error ?? new Error('Socket error'))

        socket.addEventListener('message', onMessage)
        socket.addEventListener('error', onError)
        socket.addEventListener('close', stop)

        return () => {
          socket.removeEventListener('message', onMessage)
          socket.removeEventListener('error', onError)
          socket.removeEventListener('close', stop)
        }
      },
      { highWaterMark: Infinity }
    )

    await connected()

    for await (const chunk of messages) {
      yield isArrayBuffer(chunk) ? new Uint8Array(chunk) : chunk
    }
  }())

  let isConnected = socket.readyState === 1
  let connError: Error | null

  socket.addEventListener('open', () => {
    isConnected = true
    connError = null
  })

  socket.addEventListener('close', () => {
    isConnected = false
    connError = null
  })

  socket.addEventListener('error', event => {
    if (!isConnected) {
      connError = event.error ?? new Error(`connect ECONNREFUSED ${socket.url}`)
    }
  })

  return Object.assign(source, {
    connected
  })
}
