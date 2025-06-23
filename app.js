// app.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser'); // For parsing cookies
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes'); // Assuming booking router is relevant at this stage
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes'); // For rendering views (like login page)

const app = express();

// Set up Pug as the view engine (common in many courses)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Assuming your Pug templates are in a 'views' folder

// 1) GLOBAL MIDDLEWARES
//Implement CORS 
app.use(cors());

app.options('*', cors());

// Serving static files (CSS, JS, images from 'public' folder)
// Make sure your login.html is in your 'public' folder, at the project root level.
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      // MODIFIED: Added 'data:' to fontSrc
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https://js.stripe.com', 'https://api.mapbox.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", 'https:', 'http:', "'unsafe-inline'"],
      // MODIFIED: Added 'data:' and 'blob:' to imgSrc
      imgSrc: ["'self'", 'https:', 'http:', 'data:', 'blob:'],
      // *** NEW DIRECTIVE: Add workerSrc for Mapbox
      workerSrc: ["'self'", 'blob:'], // This specifically allows web workers from same origin and blob URLs
      connectSrc: ["'self'", 'https://api.mapbox.com', 'https://events.mapbox.com', 'https://js.stripe.com', 'ws://127.0.0.1:*'],
      upgradeInsecureRequests: [],
    },
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests
  windowMs: 60 * 60 * 1000, // in 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); // Apply to API routes

/*// Stripe webhook checkout route - MUST be before body-parser (express.json())
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }), // Use express.raw for raw body
  bookingController.webhookCheckout
); // ADD THIS BLOCK*/

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Parse data from cookies

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// Add current user to response locals (if you have this middleware)
// app.use((req, res, next) => {
//   // Example: if you have an authentication system, you might set res.locals.user here
//   // res.locals.user = req.user;
//   next();
// });

// Test middleware (your custom logger)
app.use((req, res, next) => {
  //console.log(`--- Incoming Request (app.js level) ---`);
  //console.log(`Method: ${req.method}, URL: ${req.originalUrl}`);
  // console.log(`Headers:`, req.headers); // Can be very verbose
  if (req.method === 'POST') {
    //console.log(`Body (app.js level):`, req.body);
  }
  //console.log(`Cookies:`, req.cookies); // Log cookies if present
  next();
});


// 3) ROUTES (Order matters!)
// View routes (for rendering Pug templates like login, overview, tour pages)
app.use('/', viewRouter);

// API routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handles all unhandled routes (404s)
app.all('*', (req, res, next) => {
  //console.log(`--- Unhandled Request (app.js all-catch) ---`);
  //console.log(`Method: ${req.method}, URL: ${req.originalUrl}`);
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;