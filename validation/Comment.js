const validator = require('validator')
const isEmpty = require('./isEmpty')

module.exports = function validateCommentInput (data) {
  data.text = !isEmpty(data.text) ? data.text : ''

  let errors = {}
  if (validator.isEmpty(data.text)) {
    errors.text = 'Comment is required'
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  }
}
