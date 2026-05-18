/**
 * Notification Routes (routes/notifications.js)
 * GET   /api/v1/notifications              — Get all notifications
 * PATCH /api/v1/notifications/:id/read     — Mark one as read
 * PATCH /api/v1/notifications/read-all     — Mark all as read
 */
const express = require('express');
const protect = require('../middleware/auth');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

const router = express.Router();

router.use(protect);

/**
 * GET /api/v1/notifications
 * Query params:
 *   ?unread=true — Only unread notifications
 *   ?limit=20    — Limit results (default 20, max 50)
 */
router.get('/', async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const filter = { userId: req.user._id };

        if (req.query.unread === 'true') {
            filter.read = false;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit);

        // Also return unread count for badge
        const unreadCount = await Notification.countDocuments({
            userId: req.user._id,
            read: false,
        });

        res.json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read for the user.
 * NOTE: This route MUST be before /:id/read to avoid matching "read-all" as an :id
 */
router.patch('/read-all', async (req, res, next) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read`,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read.
 */
router.patch('/:id/read', async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: { read: true } },
            { returnDocument: 'after' }
        );

        if (!notification) {
            return next(ApiError.notFound('Notification not found'));
        }

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
