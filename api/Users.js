const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretOrKey = 'secret'

const User = require('../models/User')

// validation
const validateRegisterInput = require('../validation/Register')
const validateLoginInput = require('../validation/Login')

// @route         POST request to /api/users/register
// @description   register user
// @access        public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }

  // if email already exists
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = 'Email already exists'
      return res.status(400).json(errors)
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err
          } else {
            newUser.password = hash
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          }
        })
      })
    }
  })
})

// @route         POST request to /api/users/login
// @description   login user
// @access        public

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      errors.email = 'User not found'
      return res.status(404).json(errors)
    }
    bcrypt.compare(req.body.password, user.password).then(match => {
      if (match) {
        const info = {
          id: user.id,
          name: user.name
        }

        // token
        jwt.sign(info, secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          })
        })
      } else {
        errors.password = 'Password incorrect'
        return res.status(400).json(errors)
      }
    })
  })
})

// @route         DELETE request to /api/users
// @description   delete current user
// @access        private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndDelete({_id: req.user.id}).then(() => {
      res.json({ success: true })
    })
  }
)

// @route         GET request to /api/users/current
// @description   get current user
// @access        private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    })
  }
)

module.exports = router
