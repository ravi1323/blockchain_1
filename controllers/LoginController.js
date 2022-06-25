const User = require("../models/Users");
const {issueJWT, verifyPassword} = require('../utils/helper');

const UserLogin = async (req, res, next) => {
  var errors = {
    username: [],
    password: []
  }
  const user = {
    username: req.body.username,
    password: req.body.password
  }

  const findUser = await User.findOne({
    username: user.username
  })

  if(findUser) {
    const hash = findUser['hash'];
    const salt = findUser['salt'];
    
    if(verifyPassword(user.password, salt, hash)) {
      const jwt = issueJWT(findUser);
      res.cookie(`_token`, `${jwt.token}`);
      res.status(200).json({
        success: true,
        message: 'you are login successfully.',
        body: {
          user: {
            name: findUser.name,
            username: findUser.username,
            email: findUser.email,
          },
          _token: jwt.token,
          expires: jwt.expires
        }
      });
    } else {
      errors.password.push('Wrong Password');
      res.status(401).json({
        success:false,
        errors: errors
      })
    }
  } else {
    errors.username.push("Username is not registered.");
    res.status(401).json({
      success: false,
      errors: errors
    })
  }
}

module.exports = {
  UserLogin
}