/**
 * Health Score Routes (routes/healthScore.js)
 * GET /api/v1/health-score — Dynamic health score calculation
 */
const express = require('express');
const protect = require('../middleware/auth');
const { calculateHealthScore } = require('../services/healthScoreService');

const router = express.Router();

router.use(protect);

/**
 * GET /api/v1/health-score
 * Computes health score on-demand from actual behavior data.
 * Never returns a cached/stale value.
 */
router.get('/', async (req, res, next) => {
    try {
        const result = await calculateHealthScore(req.user._id);

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
