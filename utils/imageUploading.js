import multer from 'multer';
import Tour from '../models/tourModel.js';
import fs from 'fs';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('The File Uploaded was not an image, please try again with an image file', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

export const uploadTourPhotos = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}
]);

export const DeleteOldPhotoFromServer = async (photo) => {
  if (photo.startsWith('default')) return;

  const path = `./public/img/users/${photo}`;
  await fs.unlink(path, (err) => {
    if (err) return console.log(err);
    console.log('the previous photo has been deleted');
  });
};

export const deleteOldTourPictures = async (id) => {
  const tour = await Tour.findById(id);
    if (
        tour.images.length > 0 &&
        fs.existsSync(`public/img/tours/${tour.images[0]}`)
    ) {
        tour.images.forEach((image) => {
            fs.unlinkSync(`public/img/tours/${image}`);
        });
    }
    if (
        tour.imageCover &&
        fs.existsSync(`public/img/tours/${tour.imageCover}`)
    ) {
        fs.unlinkSync(`public/img/tours/${tour.imageCover}`);
    }
}
