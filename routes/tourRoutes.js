const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes'); // Assuming you have this line for nested routes

const router = express.Router();

// Middleware for param checking (example from earlier lectures, often removed later)
// router.param('id', tourController.checkID);

// Nested routes for reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
    tourController.getMonthlyPlan
  );

// Geospatial query route for finding tours within a certain distance
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// Example usage: /tours-within/250/center/34.0522,-118.2437/unit/mi

// NEW: Geospatial aggregation route for calculating distances to all tours
router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);
// Example usage: /distances/34.0522,-118.2437/unit/mi

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;