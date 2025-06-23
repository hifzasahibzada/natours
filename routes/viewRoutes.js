const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('../controllers/bookingController'); 

const router = express.Router();

/*// Middleware to set alerts based on query string
router.use(viewsController.alerts); // ADD THIS LINE
*/

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview); //remove the bookingController.createBookingChechout when implementing Stripe webhooks
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

// ADDED: New route for handling the user data update form submission
router.post(
  '/submit-user-data',
  authController.protect, // Protect this route as only logged-in users should update their data
  viewsController.updateUserData
);

module.exports = router;