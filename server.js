// require necessary NPM packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

// require route files
const exampleRoutes = require('./app/routes/example_routes')
const userRoutes = require('./app/routes/user_routes')
// const chatroomV2Routes = require('./app/routes/chatroom_V2_routes')
const chatroomV1Routes = require('./app/routes/chatroom_V1_routes')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// load secret keys for signing tokens from .env
const dotenv = require('dotenv')
dotenv.config()

// Set the key based on the current environemnt
// Set to secret key base test if in test
if (process.env.TESTENV) {
  process.env.KEY = process.env.SECRET_KEY_BASE_TEST
// Set to secret key base development if not test and no key present
// process.env.KEY is present in production and set through heroku
} else if (!process.env.KEY) {
  process.env.KEY = process.env.SECRET_KEY_BASE_DEVELOPMENT
}

// require configured passport authentication middleware
const auth = require('./lib/auth')

// establish database connection
mongoose.Promise = global.Promise
mongoose.connect(db, {
  useMongoClient: true
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:7165' }))

// define port for API to run on
const port = process.env.PORT || 4741

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use((req, res, next) => {
  if (req.headers.authorization) {
    const auth = req.headers.authorization
    // if we find the Rails pattern in the header, replace it with the Express
    // one before `passport` gets a look at the headers
    req.headers.authorization = auth.replace('Token token=', 'Bearer ')
  }
  next()
})

app.use((req, res, next) => {
  // console.log(req.body)
  next()
})

// register passport authentication middleware
app.use(auth)

// add `bodyParser` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(bodyParser.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(bodyParser.urlencoded({ extended: true }))

// register route files
app.use(exampleRoutes)
app.use(userRoutes)
// app.use(chatroomV2Routes)
app.use(chatroomV1Routes)

const server = require('http').createServer(app)
// const io = require('socket.io')(server, {origins: 'domain.com:* localhost:7165:* localhost:7165:*'})
//
// io.on('connection', (client) => {
//   // here you can start emitting events to the client
//   console.log('connected')
//
//   client.on('USER_CONNECTED', (client) => {
//     // here you can start emitting events to the client
//     console.log('connected something')
//   })
// })

// run API on designated port (4741 in this case)
server.listen(port, () => {
  console.log('listening on port ' + port)
})
// needed for testing
module.exports = app
