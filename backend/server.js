const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.join(__dirname, '.env') })


const { app } = require('./app')
const { connectDB } = require('./config/db')
const { Server } = require('socket.io')
const { createServer } = require('http')
const { attachSocketHandlers } = require('./socket/socketHandler')
const { initWorker } = require('./workers/aiWorker')

const server = createServer(app)
const PORT = process.env.PORT || 3000

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  },
})

app.locals.io = io
attachSocketHandlers(io)

connectDB().then(() => {
  initWorker(io)
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
  })
}).catch((err) => {
  console.error('Failed to connect to DB:', err)
  process.exit(1)
})
