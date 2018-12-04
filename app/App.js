const express = require('express')
// const http = require('http')
// const socketIo = require('socket.io')
// const axios = require('axios')

const port = process.env.PORT || 4741
const index = require('./routes/index')

const app = express()
app.use(index)
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4741')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization')
  next()
})

const server = require('http').createServer(app)
const io = require('socket.io')(server)

// let interval
// io.on('connection', socket => {
//   io.listen(port)
//   console.log('listen on port ', port)
//   if (interval) {
//     clearInterval(interval)
//   }
//   interval = setInterval(() => getApiAndEmit(socket), 10000)
//   socket.on('disconnect', () => {
//     console.log('Client disconnected')
//   })
// })

require('socket.io')(server, {origins: 'domain.com:* localhost:7165:* localhost:7165:*'})

// io.origins(['localhost:4741'])
//
// io.on('connection', (client) => {
//   // here you can start emitting events to the client
//   console.log('connected')
// })

server.listen(port)

// const getApiAndEmit = async socket => {
//   try {
//     const res = await axios.get(
//       ''
//     )
//     socket.emit('FromAPI', res.data.currently.temperature)
//   } catch (error) {
//     console.error(`Error: ${error.code}`)
//   }
// }

// server.listen(port, () => console.log(`Listening on port ${port}`))
