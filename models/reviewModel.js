const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// NEW/RE-ADDED: Prevent duplicate reviews (one user per tour)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE for populating user data on reviews
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// Static method to calculate average ratings and quantity
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // 'this' points to the current model (Review)
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // Persist the calculated statistics to the Tour document
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    // If all reviews for a tour are deleted, reset ratings to default values
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5 // Default average rating
    });
  }
};

// Middleware to call calcAverageRatings after a new review is saved
reviewSchema.post('save', function() {
  // 'this' points to the current review document
  // 'this.constructor' points to the Model (Review)
  this.constructor.calcAverageRatings(this.tour);
});

// Query middleware for findOneAndUpdate and findOneAndDelete
// Get the current review document before the update/delete operation
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // 'this' refers to the query object
  // By executing the query, we get the document that is currently being processed
  this.r = await this.findOne(); // Store the document on the query object
  next();
});

// Post middleware for findOneAndUpdate and findOneAndDelete
// After the update/delete operation, calculate and save new statistics
reviewSchema.post(/^findOneAnd/, async function() {
  // this.r.constructor points to the Review model
  // this.r.tour gives us the tour ID from the pre-middleware stored document
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;