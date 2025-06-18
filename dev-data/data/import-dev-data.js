const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel'); // NEW: Import User model
const Review = require('../../models/reviewModel'); // NEW: Import Review model


// Load environment variables
dotenv.config({ path: `${__dirname}/../../config.env` });

// Connect to database
// Using the provided hardcoded DB string for this script as it was in your version
const DB = 'mongodb+srv://hifza:LiBaJ9BzS6Vqw%26%2F@cluster0.mkvlrxd.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!')) // Added .then() for confirmation
  .catch(err => console.error('DB connection error:', err)); // Added .catch() for error handling

// Read JSON files
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const users = JSON.parse( // NEW: Read users.json
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviews = JSON.parse( // NEW: Read reviews.json
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours); // Import tours
    // NEW: Import users, skipping validation before save as passwords are pre-hashed
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews); // NEW: Import reviews
    console.log('Data successfully loaded!');
  } catch (err) {
    console.error('ERROR importing data:', err); // More specific error message
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany(); // Delete tours
    await User.deleteMany(); // NEW: Delete users
    await Review.deleteMany(); // NEW: Delete reviews
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error('ERROR deleting data:', err); // More specific error message
  }
  process.exit();
};

// Handle command-line arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}