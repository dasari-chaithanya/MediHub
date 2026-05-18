/**
 * JWT Auth Middleware (middleware/auth.js)
 * Extracts and verifies JWT from httpOnly cookie.
 * Attaches user to req.user on success.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
    try {
        // 1. Extract token from httpOnly cookie
        const token = req.cookies?.token;

        if (!token) {
            return next(ApiError.unauthorized('Not authenticated. Please log in.'));
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check if user still exists
        const user = await User.findById(decoded.id).select('-passwordHash');

        if (!user) {
            return next(ApiError.unauthorized('User no longer exists.'));
        }

        // 4. Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error); // errorHandler will catch JWT-specific errors
    }
};

module.exports = protect;
