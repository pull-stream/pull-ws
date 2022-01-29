import ready from './ready.js'
import type { WebSocket } from 'ws'
import type { Sink } from 'it-stream-types'

export interface SinkOptions {
  closeOnEnd?: boolean
}

export default (socket: WebSocket, options: SinkOptions) => {
  options = options ?? {}
  options.closeOnEnd = options.closeOnEnd !== false

  const sink: Sink<Uint8Array, Promise<void>> = async source => {
    for await (const data of source) {
      try {
        await ready(socket)
      } catch (err: any) {
        if (err.message === 'socket closed') break
        throw err
      }

      socket.send(data)
    }

    if (options.closeOnEnd != null && socket.readyState <= 1) {
      return await new Promise((resolve, reject) => {
        socket.addEventListener('close', event => {
          if (event.wasClean || event.code === 1006) {
            resolve()
          } else {
            const err = Object.assign(new Error('ws error'), { event })
            reject(err)
          }
        })

        setTimeout(() => socket.close())
      })
    }
  }

  return sink
}
