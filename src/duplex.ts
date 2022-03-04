import source from './source.js'
import sink from './sink.js'
import type WebSocket from './web-socket.js'
import type { SinkOptions } from './sink.js'
import type { Duplex } from 'it-stream-types'

export interface DuplexWebSocket extends Duplex<Uint8Array, Uint8Array, Promise<void>> {
  connected: () => Promise<void>
  localAddress?: string
  localPort?: number
  remoteAddress: string
  remotePort: number
  close: () => Promise<void>
  destroy: () => void
  socket: WebSocket
}

export interface DuplexWebSocketOptions extends SinkOptions {
  remoteAddress?: string
  remotePort?: number
}

export default (socket: WebSocket, options?: DuplexWebSocketOptions): DuplexWebSocket => {
  options = options ?? {}

  const connectedSource = source(socket)
  let remoteAddress: string | undefined = options.remoteAddress
  let remotePort: number | undefined = options.remotePort

  if (socket.url != null) {
    // only client->server sockets have urls, server->client connections do not
    try {
      const url = new URL(socket.url)
      remoteAddress = url.hostname
      remotePort = parseInt(url.port, 10)
    } catch {}
  }

  if (remoteAddress == null || remotePort == null) {
    throw new Error('Remote connection did not have address and/or port')
  }

  const duplex: DuplexWebSocket = {
    sink: sink(socket, options),
    source: connectedSource,
    connected: async () => await connectedSource.connected(),
    close: async () => {
      if (socket.readyState === socket.CONNECTING || socket.readyState === socket.OPEN) {
        await new Promise<void>((resolve) => {
          socket.addEventListener('close', () => {
            resolve()
          })
          socket.close()
        })
      }
    },
    destroy: () => {
      if (socket.terminate != null) {
        socket.terminate()
      } else {
        socket.close()
      }
    },
    remoteAddress,
    remotePort,
    socket
  }

  return duplex
}
