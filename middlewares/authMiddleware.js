const {verifyJWT} = require('../utils/helper')

const auth = (req, res, next) => {
  if(req.headers['authorization']) {
    const checkToken = verifyJWT(req.headers['authorization']);
    if(checkToken) {
      next();
    } else {
      return res.status(401).json({
        success:false,
        body: "Invalid authorization token."
      })
    }
  } else {
    console.log('not found');
    next();
  }
}

module.exports = {
  auth
}