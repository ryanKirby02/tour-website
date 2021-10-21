import { promisify } from 'util';
import { catchError } from '../utils/catchError.js';
import { sendToken } from '../utils/signToken.js';
import User from '../models/userModel.js';
import Review from '../models/reviewModel.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import Email from '../utils/email.js';
import crypto from 'crypto';

//middleware
export const protect = catchError(async (req, res, next) => {
  //check for and save token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'logoutToken') {
    token = req.cookies.jwt;
  }
  //check to see if there is a token, if not throw a 401 error
  if (!token)
    return next(new AppError('Not authorized, no token. Please login to get a token', 401));

  //get the id from the token
  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

  //make sure the users info wasnt deleted from the database
  const validUser = await User.findById(decodedToken.id);
  if (!validUser)
    return next(new AppError('The user belonging to this token no longer exists', 401));

  //make sure the password of the user wasnt changed since the token was signed
  const updatedPasswordCheck = await validUser.noUpdatedUser(decodedToken.iat);
  if (updatedPasswordCheck) {
    return next(
      new AppError(
        'User has recently changed their password, please log in to get a new token',
        401
      )
    );
  }
  //if all tests pass, we grants access to protected route
  req.user = validUser;
  res.locals.user = validUser;
  next();
});

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //get the id from the token
      const decodedToken = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_KEY);

      //make sure the users info wasnt deleted from the database
      const validUser = await User.findById(decodedToken.id);
      if (!validUser) return next();

      //make sure the password of the user wasnt changed since the token was signed
      const updatedPasswordCheck = await validUser.noUpdatedUser(decodedToken.iat);
      if (updatedPasswordCheck) {
        return next();
      }
      //there is a logged in user
      res.locals.user = validUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

//controllers
export const signup = catchError(async (req, res, next) => {
  const { name, email, photo, password, confirmPassword, passwordChangedAt } = req.body;
  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    confirmPassword,
    passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get('host')}/profile`;

  await new Email(newUser, url).sendWelcome();

  sendToken(newUser, 201, res);
});

export const login = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.matchPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  sendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.cookie('jwt', 'logoutToken', {
    expires: new Date(Date.now + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const forgotPassword = catchError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new AppError('there is no user with that email address', 404));
  }

  const resetToken = await user.genPasswordResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword?token=${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(
      new AppError('There is was an error processing your request. Please try again later.', 500)
    );
  }
});

export const resetPassword = catchError(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, res);
});

export const updatePassword = catchError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new AppError('user not found', 404));

  const passwordMatch = await user.matchPassword(req.body.password, user.password);
  if (!passwordMatch)
    return next(new AppError('Your current password you entered is not correct.', 401));

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();

  sendToken(user, 200, res);
});

export const checkIfAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review)
    return next(
      new AppError('Error 404: the review you are looking to edit cannot be found.', 404)
    );
  if (req.user.role !== 'admin') {
    if (review.reviewedBy.id !== req.user.id)
      return next(new AppError(`You cannot edit someone else's review.`, 403));
  }
  next();
};
