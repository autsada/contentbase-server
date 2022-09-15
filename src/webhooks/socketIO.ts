import http from 'http'
import https from 'https'
import socketIO from 'socket.io'

class SocketIO {
  public io: socketIO.Server | null

  constructor() {
    this.io = null
  }

  // Create io
  public createIO(server: https.Server | http.Server) {
    const io = new socketIO.Server(server)
    this.io = io

    return io
  }
}

export const webSocket = new SocketIO()
