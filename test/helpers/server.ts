import { WebSocketServer } from 'ws'
import type { WebSocket } from 'ws'

const port = parseInt(process.env.PORT ?? '3000', 10)

export function createTestServer (): WebSocketServer {
  const routes: Record<string, (ws: WebSocket) => void> = {
    '/read': function (ws: WebSocket) {
      const values = ['a', 'b', 'c', 'd']
      const timer = setInterval(function () {
        const next = values.shift()

        if (next != null) {
          ws.send(next)
        } else {
          clearInterval(timer)
          ws.close()
        }
      }, 100)
    },
    '/echo': function (ws: WebSocket) {
      ws.on('message', function (data) {
        ws.send(data)
      })
    }
  }
  const wss = new WebSocketServer({ port })

  wss.on('connection', function (ws, req) {
    if (req.url == null) {
      return
    }

    const fn = routes[req.url]
    if (fn != null) {
      fn(ws)
    }
  })

  return wss
}
