const router = require('express').Router()
const {accountMiddleware, profileMiddleware} = require('../middlewares/accountMiddleware');
const {signAccount, updateProfile, getProfile, followProfile, unfollowProfile} = require('../controllers/AccountController');


router.post('/', accountMiddleware, signAccount);

router.put('/profile', profileMiddleware, updateProfile);

router.get('/:id', getProfile);

router.put('/follow', followProfile)

router.put('/unfollow', unfollowProfile)

module.exports = router;