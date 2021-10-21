import express from 'express';
import {
  overviewPage,
  tourPage,
  loginPage,
  getUserProfile,
  getSignupPage,
  getResetPasswordPage,
  getForgotPasswordPage,
  getMyBookings,
} from '../controllers/viewController.js';
import { isLoggedIn, protect } from '../controllers/authController.js';
import { createBookingCheckout } from '../controllers/bookingController.js';

const router = express.Router();

//pug routes
router.get('/profile', protect, getUserProfile);
router.get('/profile/my-bookings', protect, getMyBookings)

router.use(isLoggedIn);

router.get('/', createBookingCheckout, overviewPage);
router.get('/tours/:slug', tourPage);
router.get('/login', loginPage);
router.get('/signup', getSignupPage);
router.get('/resetPassword', getResetPasswordPage);
router.get('/forgotPassword', getForgotPasswordPage);

export default router;
