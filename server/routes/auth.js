/**
 * Auth Routes (routes/auth.js)
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * GET  /api/v1/auth/me
 * POST /api/v1/auth/logout
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const eventService = require('../services/eventService');

const router = express.Router();

// --- Validation Schemas ---

const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
});

// --- Helper: Generate JWT & Set Cookie ---

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user: user.toSafeObject(),
        });
};

// --- Routes ---

/**
 * POST /api/v1/auth/register
 * Create a new user account.
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(ApiError.conflict('Email already registered'));
        }

        // Hash password and create user
        const passwordHash = await User.hashPassword(password);
        const user = await User.create({ name, email, passwordHash });

        console.log(`[AUTH] New user registered: ${email}`);

        // Fire event cascade (timeline + welcome notification)
        await eventService.emit('ACCOUNT_CREATED', { userId: user._id, name });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT cookie.
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with password hash included
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return next(ApiError.unauthorized('Invalid email or password'));
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(ApiError.unauthorized('Invalid email or password'));
        }

        console.log(`[AUTH] User logged in: ${email}`);

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user.
 */
router.get('/me', protect, async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: req.user.toSafeObject(),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/logout
 * Clear the JWT cookie.
 */
router.post('/logout', protect, (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    console.log(`[AUTH] User logged out: ${req.user.email}`);

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

module.exports = router;
