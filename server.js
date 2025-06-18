// server.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions (e.g., console.log(x))
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1); // Exit with failure code
});

dotenv.config({ path: './config.env' }); // Load environment variables from config.env
const app = require('./app'); // Import your app from app.js

// Replace with your actual database connection string from config.env
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true // Added for modern Mongoose versions
  })
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch(err => {
    console.error('DB connection error:', err.message);
    process.exit(1); // Exit if DB connection fails
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections (e.g., DB connection errors)
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1); // Exit with failure code after server closes
  });
});

// For Heroku (if you deploy there) - responds to SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});