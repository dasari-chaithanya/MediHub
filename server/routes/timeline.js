/**
 * Timeline Routes (routes/timeline.js)
 * GET /api/v1/timeline — Get paginated timeline events
 */
const express = require('express');
const protect = require('../middleware/auth');
const TimelineEvent = require('../models/TimelineEvent');

const router = express.Router();

router.use(protect);

/**
 * GET /api/v1/timeline
 * Returns timeline events for the authenticated user.
 * Query params:
 *   ?limit=20   — Number of events (default 20, max 50)
 *   ?before=<ISO date> — Cursor-based pagination (events before this date)
 */
router.get('/', async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const filter = { userId: req.user._id };

        // Cursor-based pagination
        if (req.query.before) {
            filter.createdAt = { $lt: new Date(req.query.before) };
        }

        const events = await TimelineEvent.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            count: events.length,
            events,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
