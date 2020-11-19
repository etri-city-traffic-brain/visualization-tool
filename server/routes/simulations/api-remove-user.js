const debug = require('debug')('api:remove');
const createError = require('http-errors')

module.exports = async (req, res, next) => {
  next(createError(500, 'Not implemented'))
}
