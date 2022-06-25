const { default: mongoose } = require('mongoose');
const { auth } = require('../middlewares/authMiddleware');
const NFT = require('../models/NFT');

const router = require('express').Router();

router.get('/', auth, (req, res, next) => {
  return res.status(200).json({
    success:true,
    body: 'this is testing method.'
  })
})

router.get('/:id', async (req, res, next) => {

  const id = req.params.id

  const nft = await NFT.findOne({ tokenId: id});

  return res.json({
      name: "WebPlanex",
      title: "WP nfts",
      image: nft.content_url
  })
})

module.exports = router;