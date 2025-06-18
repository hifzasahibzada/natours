// controllers/errorController.js
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name || Object.values(err.keyValue)[0];
    const message = `Duplicate field value: "${value}". Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// MODIFIED: Added req parameter and API/Rendered Website distinction
const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // B) RENDERED WEBSITE
    console.error('ERROR 🚨', err); // Log error for development debugging
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message // Send specific error message in development
    });
};

// MODIFIED: Added req parameter and API/Rendered Website distinction and refactoring
const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A.1) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // A.2) Programming or other unknown error: don't leak error details
        console.error('ERROR 🚨', err); // Log error for debugging
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }

    // B) RENDERED WEBSITE
    // B.1) Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message // Send specific error message for operational errors
        });
    }

    // B.2) Programming or other unknown error: don't leak error details
    console.error('ERROR 🚨', err); // Log error for debugging

    // MODIFIED: CRITICAL FIX from lecture: Ensure message is copied for the error object
    const error = { ...err }; // Create a copy to not modify original error object
    error.message = err.message; // Explicitly copy the message for consistent access

    return res.status(error.statusCode || 500).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.' // Generic message for unknown errors
    });
};


// MODIFIED: Added req parameter to the main error handling middleware
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res); // Pass req to sendErrorDev
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message; // CRITICAL FIX: Ensure message is copied to the error object, as demonstrated in lecture

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res); // Pass req to sendErrorProd
    }
};