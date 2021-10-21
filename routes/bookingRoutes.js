import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  updateBooking,
  getCheckoutSession,
  getOneBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/checkout-session/:tourId', protect, getCheckoutSession);

router.use(protect);
router.use(restrictTo('admin'));

router.route('/').get(getAllBookings).post(createBooking);
router.route('/:id').get(getOneBooking).delete(deleteBooking).patch(updateBooking);

export default router;
