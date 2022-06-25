const createError = require('../utils/createError');

const loginMiddleware = (req, res, next) => {
  var errors = {
    username: [],
    password: []
  }
  if(!req.body.username || req.body.username === "") {
    errors.username.push('Username is required.');
  }
  if(!req.body.password || req.body.password === "") {
    errors.password.push('Password is required.');
  }
  if(req.body.password && req.body.password.length < 4) {
    errors.password.push('Password length should greater than 4 characters.');
  }
  if(req.body.password && req.body.password.length > 16) {
    errors.password.push('Password length should less than 16 characters.');
  }

  if(errors.username.length > 0 || errors.password.length > 0) {
    createError(403, JSON.stringify(errors));
  } else {
    next();
  }
}

module.exports = {
  loginMiddleware
}