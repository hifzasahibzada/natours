const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
// REMOVED: const multer = require('multer');
// REMOVED: const sharp = require('sharp');

// --- MULTER CONFIGURATION (NEW SECTION) ---
// Define Multer storage: where to save and how to name files
/*const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // First argument is error (null if no error)
      // Second argument is the destination path
      cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
      // user-USERID-TIMESTAMP.EXTENSION
      const ext = file.mimetype.split('/')[1];
      cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
  });*/

  const multerStorage = multer.memoryStorage(); 
  
  // Define Multer filter: only allow images
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      // If it's an image, no error (null) and accept the file (true)
      cb(null, true);
    } else {
      // If not an image, pass an error and reject the file (false)
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  };
  
  // Create the Multer upload instance with storage and filter
  const upload = multer({
    storage: multerStorage, // Use the defined storage
    fileFilter: multerFilter // Use the defined filter
  });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
  
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // NEW: Set filename with .jpeg extension
  
    // Use sharp to process the image stored in memory (req.file.buffer)
    await sharp(req.file.buffer)
      .resize(500, 500) // Resize to 500x500 pixels (square)
      .toFormat('jpeg') // Convert to JPEG format
      .jpeg({ quality: 90 }) // Set JPEG quality to 90% for compression
      .toFile(`public/img/users/${req.file.filename}`); // Write the processed image to disk
  
    next(); 
  });

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

// New middleware: sets req.params.id to the current user's ID
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined, it never will be, and please use signup instead.'
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);