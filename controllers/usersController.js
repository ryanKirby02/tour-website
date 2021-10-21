import { catchError } from '../utils/catchError.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { createOne, deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';
import { DeleteOldPhotoFromServer } from '../utils/imageUploading.js';

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObject[key] = obj[key];
  });
  return newObject;
};

export const getAllUsers = getAll(User);

export const getOneUser = getOne(User);

export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User);

export const updateProfile = catchError(async (req, res, next) => {
  //create an error if the user trys to update password
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('this route is not for updating passwords.', 400));

  //update user document
  const data = filterObj(req.body, 'name', 'email');
  if(req.file) data.photo = req.file.filename

  if(req.file) await DeleteOldPhotoFromServer(req.user.photo)

  const updatedUserData = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUserData,
    },
  });
});

export const deleteProfile = catchError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getUserProfile = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
