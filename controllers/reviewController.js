// controllers/reviewController.js
const Review = require("./../models/reviewModel");
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
    // Allows nested routes to specify tour and user IDs if not already present
    if (!req.body.tour) req.body.tour = req.params.tourId; // Assumes tourId comes from URL param
    if (!req.body.user) req.body.user = req.user.id; // Assumes req.user is set by authController.protect
    next();
};

exports.getAllReviews = factory.getAll(Review); // Using factory for consistency

exports.getReview = factory.getOne(Review, { path: 'user', select: 'name photo' });
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);