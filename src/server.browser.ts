import type { ServerOptions, WebSocketServer } from './server.js'

export function createServer (opts?: ServerOptions): WebSocketServer {
  throw new Error('WebSocket Servers cannot run in browsers')
}
