const express = require('express')
const router = express.Router()
const passport = require('passport')

// Article model
const Article = require('../models/Article')
// User model
const User = require('../models/User')
// Article validation
const validateArticleInput = require('../validation/Article')
// Comment validarion
const validateCommentInput = require('../validation/Comment')

// @route POST /api/articles
// @desc create a new article
// @access private
router.post(
  '/new',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateArticleInput(req.body)
    if (!isValid) {
      return res.status(400).json(errors)
    }

    const newArticle = new Article({
      source: req.body.source,
      author: req.user.name,
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      content: req.body.content,
      user: req.user.id
    })

    newArticle.save().then(article => res.json(article))
  }
)

// @route POST /api/articles/
// @desc edit an article
// @access private
router.post(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateArticleInput(req.body)
    if (!isValid) {
      return res.status(400).json(errors)
    }

    const article = {}
    article.user = req.user.id
    article.author = req.user.name
    if (typeof req.body.source !== 'undefined') {
      article.source = req.body.source.split(',')
    }
    if (req.body.title) article.title = req.body.title
    if (req.body.description) article.description = req.body.description
    if (req.body.imageUrl) article.imageUrl = req.body.imageUrl
    if (req.body.content) article.content = req.body.content

    Article.findOneAndUpdate(
      { user: req.user.id },
      { $set: article },
      { new: true }
    ).then(article => {
      res.json(article)
    })
  }
)

// @route GET /api/articles
// @desc get all articles
// @access public
router.get('/all', (req, res) => {
  Article.find()
    .sort({ date: -1 })
    .then(articles => {
      res.json(articles)
    })
    .catch(err => res.status(404).json({ articles: 'No articles found' }))
})

// @route GET /api/articles/:id
// @desc Get single article
// @access public
router.get('/:id', (req, res) => {
  Article.findById(req.params.id)
    .then(article => {
      res.json(article)
    })
    .catch(err => res.status(404).json({ article: 'Article not found' }))
})

// @route DELETE /api/articles/:id
// @desc delete single article
// @access private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOne({ user: req.body.id }).then(user => {
      Article.findById(req.params.id)
        .then(article => {
          if (article.user.toString() !== req.user.id) {
            res.status(401).json({ notauthorized: 'User not authorized' })
          }
          article.remove().then(() => res.json({ success: 'true' }))
        })
        .catch(err => res.status(404).json({ notfound: 'Article not found' }))
    })
  }
)

// @route POST /api/articles/comments/:article_id
// @desc comment on article
// @access private
router.post(
  '/comments/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body)
    if (!isValid) {
      return res.status(400).json(errors)
    }

    Article.findById(req.params.id)
      .then(article => {
        const comment = {
          text: req.body.text,
          name: req.user.name,
          user: req.user.id,
        }
        article.comments.unshift(comment)
        article.save().then(article => {
          res.json(article)
        })
      })
      .catch(err => res.status(404).json({ article: 'Article not found' }))
  }
)

// @route DELETE /api/articles/comments/:article_id/:comment_id
// @desc  delete a comment
// @access private
router.delete(
  '/comments/:article_id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Article.findById({_id: req.params.article_id})
    .then(article => {
        if (
          article.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res.status(404).json({ comment: 'Comment not found' })
        }

        const removeIndex = article.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id)

        article.comments.splice(removeIndex, 1)

        article.save().then(article => {
          res.json(article)
        })
    })
    .catch(err => res.status(404).json({ article: 'Article not found' }))
  }
)

module.exports = router
