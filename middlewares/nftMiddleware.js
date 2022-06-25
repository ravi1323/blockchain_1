const createError = require('../utils/createError');
const path = require('path')

const nftMiddleware = (req, res, next) => {
  console.log(req.body);
  const item_types = ['auction', 'fixed', 'bid'];

  const errors = {
    title: [],
    description: [],
    category: [],
    price: [],
    type: [],
    start_date: [],
    end_date: [],
    minimum_bid: [],
    content: [],
    account: []
  }
  const today = new Date();
  const allowedContentType = ["art", "music", "domain_names", "virtual_world", "trading_cards", "collectibles", "sports", "utility"];

  if(!req.body.category || req.body.category === "") {
    errors.category.push("Content Type is required.");
  } else {
    if(!allowedContentType.includes(req.body.category)) {
      errors.category.push("Content type is not allowed.");
    }
  }



  if(!req.body.account || req.body.account === "") {
    errors.account.push("Wallet connection is required.");
  } else {
    if(req.body.account.trim().length < 39) {
      errors.account.push("Connected account hash is not valid address.")
    }
  }

  if(!req.body.title || req.body.title === "") {
    errors.title.push("Title is required.");
  } else {
    if(req.body.title.length > 20) {
      errors.title.push("Title length should not be more than 20 characters.")
    }
  }

  if(!req.body.description || req.body.description === "") {
    errors.description.push("Description is required.");
  } else {
    if(req.body.description.length > 200) {
      errors.description.push("Description length should not be more than 200 characters.");
    }
  }

  if(!req.body.type || req.body.type === "") {
    errors.type.push("Type is required.")
  } else {
    if(!item_types.includes(req.body.type)) {
      errors.type.push("Type is invalid, Allowed : ['auction', 'fixed', 'bid'] .");
    }
    if(req.body.type !== 'auction') {
      if(!req.body.price && req.body.price === "") {
        errors.price.push("Price is required.");
      }
    }

    if(req.body.type !== 'fixed') {
      if(!req.body.start_date || req.body.start_date === "") {
        errors.start_date.push("Starting date is required.");
      } else {
        if(Date.parse(req.body.start_date) < Date.parse(today)) {
          errors.start_date.push("Starting date should be now or in the future.");
        }

        if(req.body.end_date) {
          if(Date.parse(req.body.start_date) > Date.parse(req.body.end_date)) {
            errors.start_date.push("Starting date should be less than Expiration date.");
          }
        }
      }
    
      if(!req.body.end_date || req.body.end_date === "") {
        errors.end_date.push("Expiration date is required.");
      } else {
        if(Date.parse(req.body.end_date) < Date.parse(today)) {
          errors.end_date.push("Expiration date should be future time.");
        }

        if(req.body.start_date) {
          if(Date.parse(req.body.end_date) < Date.parse(req.body.start_date)) {
            errors.end_date.push("Expiration date should be greter than start time.");
          }
        }
      }

      if(!req.body.minimum_bid || req.body.minimum_bid === "") {
        errors.minimum_bid.push("Minimum bid required.");
      } else {
        if(Number(req.body.minimum_bid) === NaN) {
          errors.minimum_bid.push("Minimum bid is invalid.");
        }
      }
    }
  }

  if(req.files) {
    if(Object.keys(req.files).length === 0) {
      errors.content.push("Nft image is required.");
    } else {
      if(!req.files.content || req.files.content === "") {
        errors.content.push("Nft file is required.");
      } else {
        if(req.body.category && req.body.category === 'music') {
          if(![".mp3", ".m4a"].includes(path.extname(req.files.content.name))) {
            errors.content.push("Select file according to your category e.g, (mp3 or m4a).");
          }
        } else if(req.body.category && req.body.category === 'virtual_world') {
          if(![".mkv", ".mp4", ".avi"].includes(path.extname(req.files.content.name))) {
            errors.content.push("Select file according to your category e.g, (mp4, mkv or avi).");
          }
        } else {
          if((![".jpeg", ".jpg", ".png", ".webp"].includes(path.extname(req.files.content.name)))) {
            errors.content.push("Select file according to your category e.g, (jpeg, jpg, png or webp).");
          }
        }
      }
    }
  } else {
    errors.content.push("Nft Image is required.");
  }

  if(
    errors.title.length > 0 ||
    errors.description.length > 0 ||
    errors.price.length > 0 ||
    errors.type.length > 0 ||
    errors.start_date.length > 0 ||
    errors.end_date.length > 0 ||
    errors.content.length > 0 ||
    errors.minimum_bid.length > 0 ||
    errors.category.length > 0
  ) {
    createError(403, JSON.stringify(errors))
  } else {
    next();
  }

}

module.exports = {
  nftMiddleware
}