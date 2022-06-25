const supportedExtension = [".jpeg", ".jpg", ".png", ".mp4", ".mp3", ".webp", ".gif"];
const path = require('path')
const uuid = require('uuid')
const NFT = require('../models/NFT');
const createError = require('../utils/createError');
const fs = require('fs');
const Account = require('../models/Account');

const getNfts = async (req, res, next) => {
  const accounts = await Account.find({ "nfts.0": { "$exists": true }}).populate({
    path: 'nfts',
    populate: { path: 'likes' }
  });
  if(accounts) {
    res.status(200).json({success: true, body: accounts});
  } else {
    res.status(403).json({
      success: false,
      errors: {
        general: ["Something went wrong. failed fetching nfts."]
      }
    })
  }
}

const getLikedNftByAccount = async (req, res, next) => {
  const account = {
    hash: req.params['account_hash']
  }
  console.log(account.hash)

  if(account.hash) {
    const user = await Account.findOne({
      hash: account.hash
    })

    if(user) {
      const likedNftByUser = await NFT.find({
        likes: user._id
      }).populate('likes');

      return res.status(200).json({
        success: true,
        body: likedNftByUser
      })
    } else {
      return res.status(403).json({
        success: false,
        errors: {
          general: ["Account is not registered."]
        }
      })
    }
  } else {
    return res.status(403).json({
      success: false,
      errors: {
        general: [
          "Account hash is required in params."
        ]
      }
    })
  }
}

const getOwnedNft = async (req, res, next) => {
  const errors = {
    account: [],
    general: []
  }
  if(!req.params['account'] && req.params['account'] === "") {
    errors.account.push("Account params is required.");
  }

  if(errors.account.length > 0) {
    createError(403, JSON.stringify(errors));
  } else {
    try {
      const accounts = await Account.findOne({ hash: req.params.account }).populate({
        path: 'nfts',
        populate: { path: 'likes' }
      });

      if(accounts) {
        res.status(200).json({
          success: true,
          body: accounts
        })
      } else {
        res.status(200).json({
          success: false,
          message: "No Nft item found of yours."
        })
      }
    } catch(e) {
      errors.general.push(e.message);
      createError(403, JSON.stringify(errors));
    }
  }
}

const createNftItem = (req, res, next) => {
  const nftItem = {
    account: req.body.account,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    type: req.body.type,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    content: req.files.content,
    content_type: req.body.content_type,
    minimum_bid: req.body.minimum_bid,
    category: req.body.category
  }

  const errors = {
    content: []
  }

  if(supportedExtension.includes(path.extname(nftItem.content.name))) {
    let filename = uuid.v4() + path.extname(nftItem.content.name);

    nftItem.content.mv(path.join(__dirname, '../', 'public', 'nfts', filename), function(err) { 
      if(err) {
        errors.content.push(err.message);
        return res.status(403).json({success:false, errors:errors});
      } else {
        var newNftItem = {}
        newNftItem['title'] = nftItem.title;
        newNftItem['desc'] = nftItem.description;
        newNftItem['type'] = nftItem.type;
        newNftItem['minted'] = false;
        newNftItem['account'] = nftItem.account;
        newNftItem['content_type'] = nftItem.content_type;
        newNftItem['category'] = nftItem.category;
        
        const user = Account.findOne({ hash: nftItem.account});
        
        user.then(user => {
          if(user) {
            newNftItem['hash'] = user._id;

            if(nftItem.type !== "auction") {
              newNftItem['price'] = nftItem.price;
            }
    
            if(nftItem.type !== "fixed") {
              newNftItem['start_date'] = nftItem.start_date;
              newNftItem['end_date'] = nftItem.end_date;
              newNftItem['minimum_bid'] = nftItem.minimum_bid;
            }
    
            newNftItem['content_url'] = process.env.BASE_URL + '/nfts/' + filename;
    
            NFT.create({...newNftItem}).then(nftItem => {
              if(nftItem) {
                Account.findByIdAndUpdate(nftItem.hash, {
                  $push: {
                    nfts: nftItem._id
                  }
                }, (err, docs) => {
                  if(err) {
                    fs.unlinkSync(path.join(__dirname, '../', 'public', 'nfts', filename));
                    res.status(402).json({
                      success: false,
                      message: 'failed creating Nft item.'
                    });
                  } else {
                    res.status(201).json({
                      success: true,
                      body: docs
                    });
                  }
                })
              } else {
                res.status(402).json({
                  success: false,
                  message: 'failed creating Nft item.'
                });
              }

            }).catch(e => {
              fs.unlinkSync(path.join(__dirname, '../', 'public', 'nfts', filename));
              throw e;
            })
          } else {
            createError(403, JSON.stringify({
              account: ["Account is not registered yet, please connect your crypto wallet."]
            }))
          }
        }).catch(e => {
          createError(500, JSON.stringify({
            account: [e.message]
          }))
        })
      }
    })
  } else {
    createError(403, {
      username: [],
      profile: [`File type is not allowed : ${path.extname(nftItem.content.name)}`]
    });
  }
}

const likeNft = async (req, res, next) => {
  const account = {
    hash: req.params["account_hash"],
    nft_id: req.params["nft_id"]
  }

  console.log(account.hash, account.nft_id);

  const errors = {
    general: []
  }

  try {
  
    if(account.hash && account.nft_id) {
      const user = await Account.findOne({
        hash: account.hash
      })

      if(user) {
        NFT.findByIdAndUpdate(account.nft_id, {
          $push: {
            likes: user._id
          }
        }, function(err, docs) {
          if(err) {
            errors.general.push(err.message);
            createError(403, JSON.stringify(errors));
          } else {
            return res.status(201).json({
              success: true,
              body: docs
            })
          }
        });
      } else {
        errors.general.push("You are not registered yet.");
      }
    } else {
      errors.general.push("You are not registered yet.");
    }
  } catch(e) {
    errors.general.push(e.message);
  }

  if(errors.general.length > 0) {
    res.status(403).json({
      success: false,
      errors
    })
  }
}

const disLikeNft = async (req, res, next) => {
  const account = {
    hash: req.params["account_hash"],
    nft_id: req.params["nft_id"]
  }

  console.log(account.hash, account.nft_id);

  const errors = {
    general: []
  }

  try {
  
    if(account.hash && account.nft_id) {
      const user = await Account.findOne({
        hash: account.hash
      })

      if(user) {
        NFT.findByIdAndUpdate(account.nft_id, {
          $pull: {
            likes: user._id
          }
        }, function(err, docs) {
          if(err) {
            errors.general.push(err.message);
            createError(403, JSON.stringify(errors));
          } else {
            return res.status(201).json({
              success: true,
              body: docs
            })
          }
        });
      } else {
        errors.general.push("You are not registered yet.");
      }
    } else {
      errors.general.push("You are not registered yet.");
    }
  } catch(e) {
    errors.general.push(e.message);
  }

  if(errors.general.length > 0) {
    res.status(403).json({
      success: false,
      errors
    })
  }
}

const getSingleNft = async (req, res, next) => {
  const nft = {
    id: req.params["nft_id"]
  }

  if(nft.id) {
    const findNft = await NFT.findById(nft.id);

    if(findNft) {
      const author = await Account.findById(findNft.hash);
      const result = {
        ...findNft._doc,
        account: author
      }
      return res.status(200).json({
        success: true,
        body: result
      })
    } else {
      return res.status(403).json({
        success: false,
        errors: {
          general: ["no nft found."]
        }
      })
    }
  } else {
    return res.status(403).json({
      success: false,
      errors: {
        nft_id: ["nft id is required in params."]
      }
    })
  }
}

module.exports = {
  createNftItem,
  getNfts,
  getOwnedNft,
  likeNft,
  disLikeNft,
  getLikedNftByAccount,
  getSingleNft
}