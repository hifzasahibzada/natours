// routes/reviewRoutes.js
const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

// IMPORTANT: Initialize Express Router with mergeParams: true for nested routes
const router = express.Router({ mergeParams: true });

// PROTECT ALL REVIEW ROUTES AFTER THIS MIDDLEWARE
// All routes declared AFTER this line will require authentication
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews) 
    .post(
        authController.restrictTo('user'), 
        reviewController.setTourUserIds,
        reviewController.createReview 
    );

router
    .route('/:id')
    .get(reviewController.getReview) 
    .patch(
        // User can update their own, admin can update any
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview 
    )
    .delete(
        // User can delete their own, admin can delete any
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview // Now protected by router.use above
    );

module.exports = router;