const Account = require('../models/Account')
const uuid = require('uuid');
const createError = require('../utils/createError');
const supportedExtension = [".jpeg", ".jpg", ".png"];
const path = require('path');
const fs = require('fs');

const getProfile = async (req, res, next) => {
  const errors = {
    id: [],
    general: []
  }
  if(!req.params.id || req.params.id === "") {
    errors.id.push("Account id is required.");
  }

  if(errors.id.length > 0) {
    createError(403, JSON.stringify(errors))
  } else {
    const account = {
      hash: req.params.id
    }

    const user = await Account.findOne({
      hash: account.hash
    }).populate({
      path: 'nfts',
      populate: { path: 'likes' }
    }).populate('followers');

    if(user) {
      res.status(200).json({
        success: true,
        body: user
      })
    } else {
      errors.general.push("Account is not registered yet.");
      return res.status(403).json({
        success: false,
        errors: errors
      })
    }
  }
}

const signAccount = async (req, res, next) => {
  const account = {
    hash: req.body.hash,
    network_id: req.body.network_id,
    balance: req.body.balance,
    connect_time: new Date(),
    username: uuid.v4()
  }

  // const createAccount = await Account.create({
  //   hash: account.hash,
  //   balance: account.balance,
  //   network_id: account.network_id,
  //   connect_time: account.connect_time
  // })
  // console.log(createAccount);

  const isSignedAccount = await Account.findOne({
    hash: account.hash
  })

  // console.log(req.body);

  if(isSignedAccount) {
    const updateAccount = await Account.findOneAndUpdate({
      hash: account.hash
    }, {connect_time: new Date()})

    if(updateAccount) {
      return res.status(200).json({
        success: true,
        message: "Account signed successfully."
      })
    } else {
      return res.status(201).json({
        success: true,
        message: "failed signing existed account."
      })
    }
  } else {
    try {
      const createAccount = await Account.create({
        hash: account.hash,
        balance: account.balance.toString(),
        network_id: account.network_id,
        connect_time: account.connect_time,
        username: account.username
      })
  
      if(createAccount) {
        return res.status(201).json({
          success: true,
          message: "created account successfully."
        })
      } else {
        return res.status(201).json({
          success: true,
          message: "failed creating account."
        })
      }
    } catch(err) {
      console.log(err)
      const errors = {
        username: []
      }
      if (
        err["keyPattern"].username != "undefined" &&
        err["keyPattern"].username
      ) {
        errors.username.push("Username is already in use.");
      }
      if(errors.username.length > 0) {
        return res.status(403).json({success:false, errors: errors});
      } else {
        return res.status(405).json({ success: false, message: err.message, type: 'FROM_DB' });
      }
    }
  }
}

const unfollowProfile = async (req, res, next) => {
  const errors = {
    from_account: [],
    to_profile_id: [],
    general: []
  }
  if(!req.body.from_account || req.body.from_account === "") {
    errors.from_account.push("from_account field is required.")
  }

  if(!req.body.to_profile_id || req.body.to_profile_id === "") {
    errors.to_profile_id.push("to_profile_id field is required.");
  }

  if(errors.from_account.length > 0 && errors.to_profile_id.length > 0) {
    createError(403, JSON.stringify(errors));
  } else {
    const data = {
      from_account_hash: req.body.from_account,
      to_profile_id: req.body.to_profile_id
    }

    const to = await Account.findById(data.to_profile_id).populate('followers');
    const from = await Account.findOne({ hash: data.from_account_hash });

    if(to.hash === data.from_account_hash) {
      errors.general.push("You cant unfollow your own profile");
      res.status(403).json({
        success: false,
        errors
      })
    } else if(to.followers.filter(follower => follower.hash === data.from_account_hash).length > 0) {
      Account.findByIdAndUpdate(data.to_profile_id, {
        $pull: { followers: from._id }
      }, { new: true, upsert: true }).populate('followers').exec().then(function(docs) {

        res.status(201).json({
          success: true,
          body: docs
        })
      }).catch(err => {
        errors.general.push(err.message);
        res.status(403).json({
          success: false,
          errors
        })
      })
    } else {
      errors.general.push("You have not followed this profile yet.")
      res.status(403).json({
        success: false,
        errors
      })
    }
  }
}

const followProfile = async (req, res, next) => {
  const errors = {
    from_account: [],
    to_profile_id: [],
    general: []
  }
  if(!req.body.from_account || req.body.from_account === "") {
    errors.from_account.push("from_account field is required.")
  }

  if(!req.body.to_profile_id || req.body.to_profile_id === "") {
    errors.to_profile_id.push("to_profile_id field is required.");
  }

  if(errors.from_account.length > 0 && errors.to_profile_id.length > 0) {
    createError(403, JSON.stringify(errors));
  } else {
    const data = {
      from_account_hash: req.body.from_account,
      to_profile_id: req.body.to_profile_id
    }

    const to = await Account.findById(data.to_profile_id).populate('followers');
    const from = await Account.findOne({ hash: data.from_account_hash });

    if(to.hash === data.from_account_hash) {
      errors.general.push("You cant follow your own profile");
      res.status(403).json({
        success: false,
        errors
      })
    } else if(to.followers.filter(follower => follower.hash === data.from_account_hash).length > 0) {
      errors.general.push("You are already following this profile.")
      res.status(403).json({
        success: false,
        errors
      })
    } else {
      Account.findByIdAndUpdate(data.to_profile_id, {
        $push: { followers: from._id }
      }, { new: true, upsert: true }).populate('followers').exec().then(function(docs) {

        res.status(201).json({
          success: true,
          body: docs
        })
      }).catch(err => {
        errors.general.push(err.message);
        res.status(403).json({
          success: false,
          errors
        })
      })
    }
    
  }
}

const updateProfile = (req, res, next) => {
  const profile = {
    hash: req.body.hash,
    username: req.body.username,
    profileImage: req.files.profile,
    name: req.body.name,
    desc: req.body.desc
  }

  if(supportedExtension.includes(path.extname(profile.profileImage.name))) {
    let timestamp = Math.floor(+new Date() / 1000);
    let filename = profile.hash + path.extname(profile.profileImage.name);

    profile.profileImage.mv(path.join(__dirname, '../', 'public', 'profiles', filename), function(err) {
      if(err) {
          return res.status(403).json({success:false, errors: {
            profile: err.message
          }});
      } else {
          Account.findOneAndUpdate({
              hash: profile.hash
          }, {
            profile_pic: process.env.BASE_URL + '/profiles/' + profile.hash + path.extname(profile.profileImage.name),
            username: profile.username,
            name: profile.name,
            desc: profile.desc
          }).then(function(profile) {

            return res.status(201).json({success:true, message: "Profile has been updated."});
          }).catch(function(err) {
            fs.unlinkSync(path.join(__dirname, '../', 'public', 'profiles', filename));
            const errors = {
              username: [],
              profile: []
            }

            if (
              err["keyPattern"].username != "undefined" &&
              err["keyPattern"].username
            ) {
              errors.username.push("Username is already in use");
            }
            if(errors.username.length > 0 || errors.profile.length > 0) {
              return res.status(403).json({ success: false, errors });
            } else {
              return res.status(405).json({ success: false, message: err.message, type: 'FROM_DB' });
            }
          })
      }
    });

  } else {
    createError(403, {
      username: [],
      profile: [`File type is not allowed : ${path.extname(profile.profileImage.name)}`]
    });
  }
}

module.exports = {
  signAccount,
  updateProfile,
  getProfile,
  followProfile,
  unfollowProfile
}