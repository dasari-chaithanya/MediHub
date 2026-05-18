/**
 * Reminder Routes (routes/reminders.js)
 * GET    /api/v1/reminders               — Get all reminders for user
 * POST   /api/v1/reminders               — Create reminder
 * PATCH  /api/v1/reminders/:id           — Update reminder
 * DELETE /api/v1/reminders/:id           — Delete reminder
 * POST   /api/v1/reminders/:id/complete  — Complete (event cascade)
 */
const express = require('express');
const Joi = require('joi');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const Reminder = require('../models/Reminder');
const eventService = require('../services/eventService');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// All reminder routes require authentication
router.use(protect);

// --- Validation Schemas ---

const createReminderSchema = Joi.object({
    medicineName: Joi.string().trim().min(1).max(200).required(),
    type: Joi.string().valid('Pill', 'Injection', 'Liquid', 'Measurement').default('Pill'),
    dosage: Joi.string().trim().max(100).allow('').default(''),
    hour: Joi.number().integer().min(1).max(12).required(),
    minute: Joi.number().integer().min(0).max(59).required(),
    period: Joi.string().valid('AM', 'PM').required(),
    frequency: Joi.string().valid('daily', 'weekly', 'as_needed').default('daily'),
});

const updateReminderSchema = Joi.object({
    medicineName: Joi.string().trim().min(1).max(200),
    type: Joi.string().valid('Pill', 'Injection', 'Liquid', 'Measurement'),
    dosage: Joi.string().trim().max(100).allow(''),
    hour: Joi.number().integer().min(1).max(12),
    minute: Joi.number().integer().min(0).max(59),
    period: Joi.string().valid('AM', 'PM'),
    frequency: Joi.string().valid('daily', 'weekly', 'as_needed'),
}).min(1);

// --- Routes ---

/**
 * GET /api/v1/reminders
 * Returns all reminders for the authenticated user.
 * Query params: ?status=pending|completed|missed
 */
router.get('/', async (req, res, next) => {
    try {
        const filter = { userId: req.user._id };

        // Optional status filter
        if (req.query.status && ['pending', 'completed', 'missed'].includes(req.query.status)) {
            filter.status = req.query.status;
        }

        const reminders = await Reminder.find(filter).sort({ hour: 1, minute: 1, period: 1 });

        res.json({
            success: true,
            count: reminders.length,
            reminders,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/reminders
 * Create a new reminder. Triggers REMINDER_ADDED event.
 */
router.post('/', validate(createReminderSchema), async (req, res, next) => {
    try {
        const reminder = await Reminder.create({
            ...req.body,
            userId: req.user._id,
        });

        // Event cascade: timeline entry
        await eventService.emit('REMINDER_ADDED', {
            reminder: reminder.toJSON(),
            userId: req.user._id,
        });

        res.status(201).json({
            success: true,
            reminder,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/reminders/:id
 * Update a reminder's fields.
 */
router.patch('/:id', validate(updateReminderSchema), async (req, res, next) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { returnDocument: 'after', runValidators: true }
        );

        if (!reminder) {
            return next(ApiError.notFound('Reminder not found'));
        }

        res.json({
            success: true,
            reminder,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/reminders/:id
 * Delete a reminder.
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const reminder = await Reminder.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!reminder) {
            return next(ApiError.notFound('Reminder not found'));
        }

        res.json({
            success: true,
            message: 'Reminder deleted',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/reminders/:id/complete
 * Mark reminder as completed. THIS is the event cascade trigger.
 *
 * Side effects:
 * → Update reminder status to 'completed'
 * → Set completedAt timestamp
 * → REMINDER_COMPLETED event → timeline + notification
 */
router.post('/:id/complete', async (req, res, next) => {
    try {
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!reminder) {
            return next(ApiError.notFound('Reminder not found'));
        }

        if (reminder.status === 'completed') {
            return next(ApiError.badRequest('Reminder already completed'));
        }

        // Update status
        reminder.status = 'completed';
        reminder.completedAt = new Date();
        await reminder.save();

        // Event cascade: timeline + notification + score
        await eventService.emit('REMINDER_COMPLETED', {
            reminder: reminder.toJSON(),
            userId: req.user._id,
        });

        res.json({
            success: true,
            reminder,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
