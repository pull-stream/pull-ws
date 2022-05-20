import duplex, { DuplexWebSocket } from './duplex.js'
import { WebSocketServer as WSServer } from 'ws'
import http from 'http'
import https from 'https'
import { EventEmitter } from 'events'
import type { VerifyClientCallbackSync, VerifyClientCallbackAsync, AddressInfo } from 'ws'
import type WebSocket from './web-socket.js'

export interface ServerOptions {
  key?: string
  cert?: string
  server?: http.Server | https.Server
  verifyClient?: VerifyClientCallbackAsync | VerifyClientCallbackSync
  onConnection?: (connection: DuplexWebSocket) => void
}

export interface WebSocketServer extends EventEmitter {
  listen: (addrInfo: { port: number } | number) => Promise<WebSocketServer>
  close: () => Promise<void>
  address: () => string | AddressInfo | null
}

class Server extends EventEmitter {
  private readonly server: http.Server | https.Server

  constructor (server: http.Server | https.Server) {
    super()

    this.server = server
  }

  async listen (addrInfo: { port: number } | number) {
    return await new Promise<WebSocketServer>(resolve => {
      this.once('listening', () => resolve(this))
      this.server.listen(typeof addrInfo === 'number' ? addrInfo : addrInfo.port)
    })
  }

  async close () {
    return await new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err != null) {
          return reject(err)
        }

        resolve()
      })
    })
  }

  address () {
    return this.server.address()
  }
}

export function createServer (opts?: ServerOptions): WebSocketServer {
  opts = opts ?? {}

  const server = opts.server ?? (opts.key != null && opts.cert != null ? https.createServer(opts) : http.createServer())
  const wss = new Server(server)

  if (opts.onConnection != null) {
    wss.on('connection', opts.onConnection)
  }

  function proxy (server: http.Server, event: string) {
    return server.on(event, (...args: any[]) => {
      wss.emit(event, ...args)
    })
  }

  const wsServer = new WSServer({
    server: server,
    perMessageDeflate: false,
    verifyClient: opts.verifyClient
  })

  proxy(server, 'listening')
  proxy(server, 'request')
  proxy(server, 'close')

  wsServer.on('connection', function (socket: WebSocket, req: http.IncomingMessage) {
    const addr = wsServer.address()

    if (typeof addr === 'string') {
      wss.emit('error', new Error('Cannot listen on unix sockets'))
      return
    }

    if (req.socket.remoteAddress == null || req.socket.remotePort == null) {
      wss.emit('error', new Error('Remote connection did not have address and/or port'))
      return
    }

    const stream: DuplexWebSocket = {
      ...duplex(socket, {
        remoteAddress: req.socket.remoteAddress,
        remotePort: req.socket.remotePort
      }),
      localAddress: addr.address,
      localPort: addr.port
    }

    wss.emit('connection', stream, req)
  })

  return wss
}
