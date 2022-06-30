const mongoose = require('mongoose')

const NFTSchema = mongoose.Schema({
  hash:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts',
    require: true
  },
  category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  minimum_bid: {
    type: Number
  },
  content_url: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts'
  }],
  price: {
    type: Number
  },
  minted: {
    type: Boolean,
    required: true
  },
  transaction_hash: {
    type: String
  },
  tokenId: {
    type: Number
  }
}, { timestamps: true })

module.exports = mongoose.model('nfts', NFTSchema);