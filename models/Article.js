const mongoose = require('mongoose')

const Article = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  source: { type: [String] },
  author: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  content: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      text: { type: String, required: true },
      name: { type: String },
      date: { type: Date, default: Date.now }
    }
  ]
})

module.exports = mongoose.model('articles', Article)
