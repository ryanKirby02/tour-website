import mongoose from 'mongoose';
import Tour from './tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    reviewText: {
      type: String,
      required: [true, 'Please tell us about your experience'],
      maxLength: [200, 'Your review can not be more than 200 characters'],
      minLength: [10, 'Your review must be at least 10 characters'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Your rating is required'],
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, reviewedBy: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviewedBy',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.clacAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.clacAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.clacAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
