const mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
  hash: {
    type: String,
    require: true,
    unique: true
  },
  network_id: {
    type: Number,
    require: true
  },
  balance: {
    type: String,
    require: true
  },
  profile_pic: {
    type: String
  },
  name: {
    type: String
  },
  username: {
    type: String,
    unique: true
  },
  desc: {
    type: String
  },
  connect_time: {
    type: Date,
    require: true
  },
  nfts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'nfts'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts'
  }],
  disconnect_time: {
    type: Date
  }
}, { timestamps: true })

module.exports = mongoose.model('accounts', AccountSchema);