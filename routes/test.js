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

  if(nft) {
    return res.json({
      name: "WebPlanex",
      title: "WP nfts",
      image: nft.content_url
    })
  } else {
    return res.json({
      success: false,
      message: "No NFT is minted within provided NFT Token."
    })
  }
})

module.exports = router;