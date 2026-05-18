/**
 * Profile Routes (routes/profile.js)
 * GET  /api/v1/profile     — Get authenticated user's profile
 * PATCH /api/v1/profile    — Update profile fields
 */
const express = require('express');
const Joi = require('joi');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const eventService = require('../services/eventService');

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// --- Validation Schema ---

const updateProfileSchema = Joi.object({
    age: Joi.number().integer().min(1).max(150),
    height: Joi.number().min(30).max(300),
    weight: Joi.number().min(1).max(500),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null),
    calmMode: Joi.boolean(),
    notificationPreferences: Joi.object({
        reminders: Joi.boolean(),
        health: Joi.boolean(),
        system: Joi.boolean(),
    }),
}).min(1); // At least one field required

// --- Routes ---

/**
 * GET /api/v1/profile
 * Returns the authenticated user's profile with computed BMI.
 * Auto-creates a profile if one doesn't exist (first-time login).
 */
router.get('/', async (req, res, next) => {
    try {
        // Atomic upsert: find or create in one operation (no race condition)
        const profile = await UserProfile.findOneAndUpdate(
            { userId: req.user._id },
            { $setOnInsert: { userId: req.user._id } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            profile: profile.toJSON(),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/profile
 * Update profile fields. Marks user as onboarded if health data is provided.
 */
router.patch('/', validate(updateProfileSchema), async (req, res, next) => {
    try {
        // Atomic upsert + update in one operation
        const profile = await UserProfile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: req.body },
            { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
        );

        // Mark user as onboarded if key health data is now present
        const hasHealthData = profile.age && profile.height && profile.weight;
        if (hasHealthData && !req.user.onboarded) {
            await User.findByIdAndUpdate(req.user._id, { onboarded: true });
        }

        // Emit profile update event for timeline
        await eventService.emit('PROFILE_UPDATED', { userId: req.user._id });

        res.json({
            success: true,
            profile: profile.toJSON(),
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
