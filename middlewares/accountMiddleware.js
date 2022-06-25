const createError = require('../utils/createError')
const numberRegex = /^[0-9]*$/
const validNetworks = [1, 3, 4, 5, 5777];

const accountMiddleware = (req, res, next) => {
  const errors = {
    hash: [],
    network_id: [],
    balance: []
  }
  if(!req.body.hash || req.body.hash === "") {
    errors.hash.push("Connected account hash is required.");
  } else {
    if(req.body.hash.trim().length < 39) {
      errors.hash.push("Connected account hash is not valid address.")
    }
  }

  if(typeof req.body.network_id !== "number") {
    errors.network_id.push("network id is not valid.");
  } else {
    if(!validNetworks.includes(Number(req.body.network_id))) {
      errors.network_id.push("network id is not valid.");
    }
  }

  if(typeof req.body.balance !== "number") {
    errors.balance.push("Invalid balance")
  }

  if(errors.hash.length > 0 || errors.network_id.length > 0 || errors.balance.length > 0) {
    createError(403, JSON.stringify(errors))
  } else {
    next();
  }
}

const profileMiddleware = (req, res, next) => {
  const errors = {
    hash: [],
    username: [],
    profile: [],
    desc: [],
    name: []
  }

  if(!req.body.hash || req.body.hash === "") {
    errors.hash.push("Connected account hash is required.");
  } else {
    if(req.body.hash.trim().length < 39) {
      errors.hash.push("Connected account hash is not valid address.")
    }
  }

  if(!req.body.name || req.body.name === "") {
    errors.name.push("Name is required.");
  }

  if(Object.keys(req.files).length === 0) {
    errors.profile.push("Profile image is required.");
  }

  if(!req.body.username || req.body.username === "") {
    errors.username.push("Username is required.");
  }

  if(!req.body.desc || req.body.desc === "") {
    errors.desc.push("Description is required.");
  }

  if(errors.hash.length > 0 || errors.name.length > 0 || errors.username.length > 0 || errors.profile.length > 0 || errors.desc.length > 0) {
    createError(403, JSON.stringify(errors));
  } else {
    next();
  }
  
}

module.exports = {
  accountMiddleware,
  profileMiddleware
}