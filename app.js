require('dotenv').config();
require('./utils/db_connection');
const express = require('express')
const cors = require('cors')
var logger = require('morgan');
var createError = require('http-errors');
var path = require('path');
const FileUpload = require('express-fileupload')

const app = express()

app.use(express.json());
app.use(cors());
app.use(FileUpload());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));

// app.use('/users', require('./routes/UserRoute'));
app.use('/api/test', require('./routes/test'))
app.use('/api/account', require('./routes/AccountRoute'))
app.use('/api/nft', require('./routes/NFTRoutes'));

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

app.get('*', (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.send({
//     errors: JSON.parse(err.message)
//   });
// });

app.use((err, req, res, next) => {
  var errorData = {
    statusCode: 500,
    body: ''
  }
  if(err.name === 'validation') {
    errorData.body= JSON.parse(err.message);
    errorData.statusCode = err.statusCode;
  } else {
    errorData.body = err.message
    errorData.statusCode = 500;
  }

  return res.status(errorData.statusCode).json({
    success: false,
    errors: errorData.body
  })
})

module.exports = app;