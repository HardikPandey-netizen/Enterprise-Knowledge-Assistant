const AppError = require('./../utils/appError');
module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })

}

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}`
  return new AppError(message,400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
}

const handleJWTError = err => new AppError('Invalid Token! Please log in again',401);
const handleJWTExpiry = err => new AppError('Your login has expired! Kindly login again');

const sendErrorDev = (err,res)=> {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    })
  };
  
  const sendErrorProd = (err,res) => {
    if(err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }
    else{
      // console.error('Error 💥',err);
  
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      })
    }
  }
  
  
  module.exports = (error, req, res, next) => {   // When there is 4 parameters express will understand that it is a error handling middleware
      // console.log(err.stack);
      
      error.statusCode = error.statusCode || 500; //500-> Internal Server Error
      error.status = error.status || 'error'
      if(process.env.NODE_ENV === 'development') {
        sendErrorDev(error,res)
      }
      else if(process.env.NODE_ENV === 'production') {
        let error = {...err}
        if(error.name == 'CastError') error = handleCastErrorDB(err);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name == 'JsonWebTokenError') error = handleJWTError(error);
        if(error.name == 'TokenExpiredError') error = handleJWTExpiry(error);
        sendErrorProd(error,res);
      }
      
}