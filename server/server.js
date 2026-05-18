/**
 * MediHub Backend — Server Entry Point (server.js)
 *
 * Express application with:
 * - MongoDB via Mongoose
 * - JWT auth (httpOnly cookies)
 * - Joi request validation
 * - Rate limiting (stricter on auth)
 * - Helmet security headers
 * - Morgan request logging
 * - Centralized error handling
 * - API versioning (/api/v1/)
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { connectDB, disconnectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// --- Route Imports ---
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const reminderRoutes = require('./routes/reminders');
const timelineRoutes = require('./routes/timeline');
const notificationRoutes = require('./routes/notifications');
const medicineRoutes = require('./routes/medicines');
const healthScoreRoutes = require('./routes/healthScore');

// --- Services ---
const { startScheduler } = require('./services/scheduler');

// --- Initialize Express ---
const app = express();

// --- Global Middleware ---

// Security headers
app.use(helmet());

// CORS — allow frontend origin with credentials
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://127.0.0.1:5500',
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// --- Rate Limiting ---

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
    message: { success: false, message: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/v1/auth/', authLimiter);

// --- API Routes (v1) ---

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'MediHub API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/timeline', timelineRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/health-score', healthScoreRoutes);

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// --- Centralized Error Handler (MUST be last) ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    // Start reminder scheduler
    startScheduler();

    app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`  MediHub API Server`);
        console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`  Port: ${PORT}`);
        console.log(`  API: http://localhost:${PORT}/api/v1/`);
        console.log(`========================================\n`);
    });
};

startServer();

// --- Graceful Shutdown ---
const shutdown = async (signal) => {
    console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);
    await disconnectDB();
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app; // For testing

