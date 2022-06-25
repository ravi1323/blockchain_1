const createError = (statusCode, errorMessage) => {
  var error = new Error();
  error.message = errorMessage;
  error.statusCode = statusCode;
  error.name = 'validation';

  throw error;
}

module.exports = createError;