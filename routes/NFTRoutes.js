const router = require('express').Router();
const { nftMiddleware } = require('../middlewares/nftMiddleware');
const { createNftItem, getNfts, getOwnedNft, likeNft, disLikeNft, getLikedNftByAccount, getSingleNft } = require('../controllers/NftController');

router.post('/', nftMiddleware, createNftItem);

router.get('/', getNfts);

router.get('/single/:nft_id', getSingleNft);

router.get('/:account', getOwnedNft);

router.get('/like/:account_hash/:nft_id', likeNft);

router.get('/dislike/:account_hash/:nft_id', disLikeNft);

router.get('/like/:account_hash', getLikedNftByAccount);

module.exports = router;