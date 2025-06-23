const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('../models/bookingModel'); 
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/*//For Stripe intergration
exports.alerts = (req, res, next) => { // ADD THIS BLOCK
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      'Your booking was successful! Please check your email for a confirmation. If your booking doesn\'t show up here immediately, please come back later.';
  }
  next();
};*/

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
    page: 'overview'
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  // Handle tour not found for rendered pages
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    page: 'tour'
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
    page: 'login'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account',
    page: 'signup'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    page: 'account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings for the currently logged-in user
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  // The '$in' operator selects documents where the value of a field (here, _id) equals any value in the specified array (tourIDs)
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // 3) Render the page using the overview template
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

// ADDED: New handler for updating user data from the HTML form
exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log('UPDATING USER DATA', req.body); // For debugging during lecture

  // Find user by ID and update only specific fields (name, email)
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true, // Return the modified document rather than the original
      runValidators: true // Run schema validators on the update
    }
  );

  // Re-render the account page with the updated user data
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser, // Pass the updated user directly to the template
    page: 'account'
  });
});