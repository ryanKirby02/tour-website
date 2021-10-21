import express from 'express';
import { checkIfAuthor, protect, restrictTo } from '../controllers/authController.js';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourUserIds,
  updateReview,
} from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/').get(getAllReviews).post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), checkIfAuthor, deleteReview)
  .patch(restrictTo('user', 'admin'), checkIfAuthor, updateReview)
  .get(getReview);

export default router;
