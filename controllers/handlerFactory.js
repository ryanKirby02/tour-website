import { catchError } from '../utils/catchError.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

export const deleteOne = (Model) =>
  catchError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('ERROR 404: the document with that id was not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchError(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError('ERROR 404: the document with that id was not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: updatedDoc,
      },
    });
  });

export const createOne = (Model) =>
  catchError(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        document: doc,
      },
    });
  });

export const getAll = (Model) =>
  catchError(async (req, res, next) => {
    //to allow for nested Get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    doc.id = undefined;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { documents: doc },
    });
  });

export const getOne = (Model, populateOptions) =>
  catchError(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('ERROR 404: the document with that id was not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: doc,
      },
    });
  });
