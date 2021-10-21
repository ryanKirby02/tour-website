import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import { catchError } from '../utils/catchError.js';

export const overviewPage = catchError(async (req, res, next) => {
  //get tour data from colleaction
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const tourPage = catchError(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reviewText rating reviewedBy',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

export const loginPage = catchError(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

export const getUserProfile = (req, res) => {
  res.locals.active = 'profile true';

  res.status(200).render('accountSettings', {
    title: 'Your Account Details',
  });
};

export const getSignupPage = catchError(async (req, res) => {
  res.status(200).render('signup', {
    title: 'signup for an account',
  });
});

export const getForgotPasswordPage = catchError(async (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Your Password?',
  });
});

export const getResetPasswordPage = (req, res) => {
  if (!res.locals.user) {
    const { token } = req.query;
    return res.status(200).render('resetPassword', {
      title: 'Reset Your Password',
      token,
    });
  }
  res.redirect('/profile');
};

export const getMyBookings = catchError(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.locals.active = 'bookings true';

  res.status(200).render('myBookings', {
    title: 'My Booked Tours',
    tours,
  });
});
