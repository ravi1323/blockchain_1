const createError = require('../utils/createError');
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const phoneRegex = /^[0-9]*$/

const registerMiddleware = (req, res, next) => {
  const errors = {
    name: [],
    username: [],
    email: [],
    phone: [],
    password: []
  }

  if(!req.body.phone || req.body.phone === "") {
    errors.phone.push("Phone number is required.");
  } else {
    if(req.body.phone.trim().length < 10) {
      errors.phone.push("Phone number should be at least 10 character long");
    }
    if(req.body.phone.trim().length > 15) {
      errors.phone.push("Phone number length should not be more than 15 character.");
    }
    if(!phoneRegex.test(req.body.phone)) {
      errors.phone.push("Phone number is only allows numbers.");
    }
  }

  // Name validation
  if(!req.body.name || req.body.name === "") {
    errors.name.push("Name is required.");
  } else {
    if(req.body.name.trim().length < 4) {
      errors.name.push("Name length should be at least 4 character long");
    }
    if(req.body.name.trim().length > 20) {
      errors.name.push("Name length should not be more than 20 character.");
    }
  }

  // Username validation
  if(!req.body.username || req.body.username == '') {  
    errors.username.push("Username is required")
  } else {
    // if username length is less than 4
    if(req.body.username.trim().length < 4) {
      errors.username.push("Username length should be at least 4 character long.")
    }

    // if username length is greter than 20
    if(req.body.username.trim().length > 20) {
      errors.username.push("Username length should not be more than 20 character long.")
    }
  }

  // Email validation
  if(!req.body.email || req.body.email === "") {
    errors.email.push("Email is required.");
  } else {
    if(req.body.email && !emailRegex.test(req.body.email)) {
      errors.email.push("Email is invalid.")
    }
  }

  // Password validation
  if(!req.body.password || req.body.password === "") {
    errors.password.push('Password is required.');
  } else {
    if(req.body.password && req.body.password.length < 4) {
      errors.password.push('Password length should greater than 4 characters.');
    }
    if(req.body.password && req.body.password.length > 16) {
      errors.password.push('Password length should less than 16 characters.');
    }
  }

  if(errors.email.length > 0 || errors.password.length > 0 || errors.name.length > 0 || errors.phone.length > 0) {
    createError(403, JSON.stringify(errors));
  } else {
    next();
  }
}

module.exports = {
  registerMiddleware
}