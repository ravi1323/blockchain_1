const router = require('express').Router();
const { UserLogin } = require('../controllers/LoginController');
const { loginMiddleware } = require('../middlewares/loginMiddleware')
const { UserRegister } = require('../controllers/RegisterController');
const { registerMiddleware } = require('../middlewares/registerMiddleware');


router.post('/', loginMiddleware, UserLogin)
router.post('/register', registerMiddleware, UserRegister)

module.exports = router;