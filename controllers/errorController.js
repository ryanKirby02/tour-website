import AppError from '../utils/appError.js';

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (error) => {
  const field = JSON.stringify(Object.keys(error.keyValue).join(' '));
  const value = JSON.stringify(Object.values(error.keyValue).join(' '));

  const message = `Duplicate field ${field} with value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((object) => object.message);

  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again.', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired, please login again to get a new token.', 401);

const sendErrorForDev = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  }
  console.error('ERROR:', error);
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong',
    msg: error.message,
  });
};

const sendErrorForProduction = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    console.error('ERROR:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on our end, please try again later.',
    });
  }

  if (error.isOperational) {
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong',
      msg: error.message,
    });
  }
  console.error('ERROR', error);
  return res.status(error.statusCode).render('error', {
    title: 'Something Went Wrong',
    msg: 'Something went wrong on our end, please try again later.',
  });
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateFields(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorForProduction(error, req, res);
  }
};
