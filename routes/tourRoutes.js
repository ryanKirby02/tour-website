import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  aliasTopTours,
  deleteTour,
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} from '../controllers/toursController.js';
import { resizeTourImages } from '../utils/imageProcessing.js';
import { uploadTourPhotos } from '../utils/imageUploading.js';
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.get('/within/:distance/center/:latlng/unit/:unit', getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getOneTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourPhotos, resizeTourImages, updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

export default router;
