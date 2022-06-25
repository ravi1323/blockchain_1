const { issueJWT } = require('../../../nft-wp/backend/helpers/utils');
const User = require('../models/Users')
const {hashPassword} = require('../utils/helper')
const UserRegister = (req, res, next) => {
  const user = {
    name:  req.body.name,
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password
  }

  const genPassword = hashPassword(user.password);

  const newUser = User.create({
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    hash: genPassword.hash,
    salt: genPassword.salt
  })

  newUser.then(new_user => {
    if(new_user) {
      const jwt = issueJWT(new_user);
      return res.status(201).json({
        success:true,
        message: 'You registered successfully.',
        body: {
          name: new_user.name,
          username: new_user.username,
          phone: new_user.phone,
          email: new_user.email,
          token: jwt.token,
          expires: jwt.expires
        }
      })
    } else {
      return res.status(500).json({
        success:false,
        message: 'Something went wrong.'
      })
    }
  }).catch(err => {
    const errors = {
      name: [],
      phone: [],
      email: [],
      username: [],
      password: []
    }
    if(err) {
      if (
        err["keyPattern"].email != "undefined" &&
        err["keyPattern"].email
      ) {
        errors.email.push("Email is already registered.");
      }
      if (
        err["keyPattern"].username != "undefined" &&
        err["keyPattern"].username
      ) {
        errors.username.push("Username is already in use.");
      }
      if(errors.email.length > 0 || errors.username.length > 0) {
        return res.status(403).json({success:false, errors: errors});
      } else {
        return res.status(405).json({ success: false, message: err.message, type: 'FROM_DB' });
      }
    }
  })
}

module.exports = {
  UserRegister
}