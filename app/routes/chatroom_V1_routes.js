// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for chatrooms
const Chatroom = require('../models/chatroom_V1')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /chatrooms
// router.get('/chatrooms', requireToken, (req, res) => {
//   // console.log(req)
//   Chatroom.find()
//     .then(chatrooms => {
//       // const newChatrooms = []
//       const userChatrooms = chatrooms.filter(chatroom => {
//         // console.log(chatroom.owner + "Blurg")
//         // console.log(chatroom.owner)
//         // console.log('whoa')
//         if (chatroom.owner == req.user.id) {
//           // console.log('you are running the successfull double equals')
//           // userChatrooms.push('you pushed something')
//           // console.log(chatroom.owner + "Blah")
//           // userChatrooms.push('you pushed something')
//           return true
//         }
//         // chatrooms.filter(chatroom => req.body.chatroom.owner)
//         // console.log(chatroom.owner + "Blah")
//       })
//
//       // console.log(chatroom.owner + "Olgrr")
//
//       chatrooms.filter(chatroom => req.body.chatroom.owner)
//
//       requireOwnership(req, chatrooms)
//
//       // `chatrooms` will be an array of Mongoose documents
//       // we want to convert each one to a POJO, so we use `.map` to
//       // apply `.toObject` to each one
//
//       return chatrooms.map(chatroom => chatroom.toObject())
//     })
//     // respond with status 200 and JSON of the chatrooms
//     .then(chatrooms => res.status(200).json({ chatrooms: chatrooms }))
//     // if an error occurs, pass it to the handler
//     .catch(err => handle(err, res))
// })

router.get('/chatrooms', requireToken, (req, res) => {
  Chatroom.find()
    .then(chatrooms => {
      const chatroomsbyOwner = chatrooms.filter(chatroom => {
        if (chatroom.owner == req.user.id) {
          return true
        }
      })

      return chatroomsbyOwner.map(chatroom => chatroom.toObject())
    })
    .then(chatrooms => res.status(200).json({ chatrooms: chatrooms }))
    .catch(err => handle(err, res))
})

// SHOW
// GET /chatrooms/5a7db6c74d55bc51bdf39793
router.get('/chatrooms/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  Chatroom.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "chatroom" JSON
    .then(chatroom => res.status(200).json({ chatroom: chatroom.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// CREATE
// POST /chatrooms
router.post('/chatrooms', requireToken, (req, res) => {
  // console.log(req.body, req.user)
  // set owner of new chatroom to be current user
  req.body.chatroom.owner = req.user.id

  Chatroom.create(req.body.chatroom)
    // respond to succesful `create` with status 201 and JSON of new "chatroom"
    .then(chatroom => {
      res.status(201).json({ chatroom: chatroom.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

// UPDATE
// PATCH /chatrooms/5a7db6c74d55bc51bdf39793
router.patch('/chatrooms/:id', requireToken, (req, res) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.chatroom.owner

  Chatroom.findById(req.params.id)
    .then(handle404)
    .then(chatroom => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, chatroom)

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      Object.keys(req.body.chatroom).forEach(key => {
        if (req.body.chatroom[key] === '') {
          delete req.body.chatroom[key]
        }
      })

      // pass the result of Mongoose's `.update` to the next `.then`
      return chatroom.update(req.body.chatroom)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// DESTROY
// DELETE /chatrooms/5a7db6c74d55bc51bdf39793
router.delete('/chatrooms/:id', requireToken, (req, res) => {
  Chatroom.findById(req.params.id)
    .then(handle404)
    .then(chatroom => {
      // throw an error if current user doesn't own `chatroom`
      requireOwnership(req, chatroom)
      // delete the chatroom ONLY IF the above didn't throw
      chatroom.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
