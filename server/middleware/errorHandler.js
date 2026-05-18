/**
 * Centralized Error Handler Middleware (middleware/errorHandler.js)
 * Catches all errors and returns structured JSON responses.
 */
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    // Default to 500 if no status code set
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let details = err.details || null;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = 'Validation failed';
        details = messages;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Log server errors in development
    if (statusCode >= 500 && process.env.NODE_ENV === 'development') {
        console.error('[ERROR]', err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
};

module.exports = errorHandler;
