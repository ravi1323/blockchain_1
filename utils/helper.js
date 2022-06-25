const crypto = require("crypto");
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

var emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

var pathTokey = path.join(__dirname, '..', 'id_rsa_priv.pem');
var PRIV_KEY = fs.readFileSync(pathTokey,'utf-8')

var pathToPubKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
var PUB_KEY = fs.readFileSync(pathToPubKey, 'utf-8');


// encrypt password
module.exports.hashPassword = (password) => {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("base64");
  return {
    salt,
    hash,
  };
};

// verify password
module.exports.verifyPassword = (password, salt, hash) => {
  const newHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("base64");
  return hash === newHash;
};

module.exports.validateEmail = (email) => {
  return emailRegex.test(email);
};

// issue JWT token
module.exports.issueJWT = (user) => {
  const id = user._id;
  const expireIn = '1d';
  const payload = {
    sub: id,
    iat: Date.now()
  }

  const jwt = jsonwebtoken.sign(payload, PRIV_KEY, {expiresIn:expireIn, algorithm: 'RS256'});
  return {
    token: jwt,
    expires:expireIn
  }
}

module.exports.verifyJWT = (token) => {
  if(token) {
    try {
      return jsonwebtoken.verify(token, PUB_KEY, function(err, decode) {
        if(err) {
          console.log(err);
          return false;
        }
        if(decode) {
          return decode.sub;
        }
      })
    } catch(e) {
      console.log(e.message);
      return false;
    }
  } else {
    return false;
  }
}
