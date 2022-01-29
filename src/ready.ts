import type { ErrorEvent, WebSocket } from 'ws'

export default (socket: WebSocket) => {
  // if the socket is closing or closed, return end
  if (socket.readyState >= 2) {
    throw new Error('socket closed')
  }

  // if open, return
  if (socket.readyState === 1) {
    return
  }

  return new Promise<void>((resolve, reject) => {
    function cleanup () {
      socket.removeEventListener('open', handleOpen)
      socket.removeEventListener('error', handleErr)
    }

    function handleOpen () {
      cleanup()
      resolve()
    }

    function handleErr (event: ErrorEvent) {
      cleanup()
      reject(event.error ?? new Error(`connect ECONNREFUSED ${socket.url}`))
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('error', handleErr)
  })
}
