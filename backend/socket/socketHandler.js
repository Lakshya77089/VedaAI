function attachSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('subscribe:dashboard', () => {
      socket.join('dashboard')
    })
    
    socket.on('subscribe:assignment', (assignmentId) => {
      socket.join(`assignment:${assignmentId}`)
    })

    socket.on('unsubscribe:assignment', (assignmentId) => {
      socket.leave(`assignment:${assignmentId}`)
    })
  })
}

module.exports = { attachSocketHandlers }
