const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')

const users = require('./api/Users')
const articles = require('./api/Articles')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const mongoURI = 'mongodb://amer:amer123@ds163054.mlab.com:63054/news-portal'
mongoose
  .connect(
    mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

app.use(passport.initialize())
require('./passport')(passport)

app.use('/api/users', users)
app.use('/api/articles', articles)

const port = 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
