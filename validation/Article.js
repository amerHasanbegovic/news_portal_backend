const validator = require('validator')
const isEmpty = require('./isEmpty')

module.exports = function validateArticleInput (data) {
  data.title = !isEmpty(data.title) ? data.title : ''
  data.description = !isEmpty(data.description) ? data.description : ''
  data.content = !isEmpty(data.content) ? data.content : ''
  data.imageUrl = !isEmpty(data.imageUrl) ? data.imageUrl : ''

  let errors = {}
  if (validator.isEmpty(data.title)) {
    errors.title = 'Article title is required'
  }
  if (validator.isEmpty(data.content)) {
    errors.content = 'Article content is required'
  }
  if (!validator.isLength(data.content, { min: 300 })) {
    errors.content = 'Article content must be over 300 characters'
  }
  if (validator.isEmpty(data.imageUrl)) {
    errors.imageUrl = 'Image is required'
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  }
}
