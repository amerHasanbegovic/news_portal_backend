const strategy = require('passport-jwt').Strategy
const extractJwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')
require('./models/User')
const User = mongoose.model('users')
const secretOrKey = require("./config/default").secretOrKey

const options = {}
options.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken()
options.secretOrKey = secretOrKey

module.exports = passport => {
  passport.use(
    new strategy(options, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        })
        .catch(err => console.log(err))
    })
  )
}
