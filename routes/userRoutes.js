import express from 'express';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signup,
  updatePassword,
  restrictTo,
  logout,
} from '../controllers/authController.js';
import {
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  updateProfile,
  deleteProfile,
  getUserProfile,
} from '../controllers/usersController.js';
import { uploadUserPhoto } from '../utils/imageUploading.js';
import { resizeUserPhoto } from '../utils/imageProcessing.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

//protect all routes after this middleware
router.use(protect);

router.get('/profile', getUserProfile, getOneUser);
router.patch('/update-password', updatePassword);
router.patch('/update-profile', uploadUserPhoto, resizeUserPhoto, updateProfile);
router.delete('/delete-profile', deleteProfile);

//restrict all routes to admin after this middleware
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

export default router;
