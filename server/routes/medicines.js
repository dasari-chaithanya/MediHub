/**
 * Medicine Routes (routes/medicines.js)
 * Public endpoints — no auth required for browsing medicines.
 *
 * GET /api/v1/medicines              — List all (paginated)
 * GET /api/v1/medicines/search?q=    — Full-text search
 * GET /api/v1/medicines/category/:cat — Filter by category
 * GET /api/v1/medicines/:id          — Single medicine with populated substitutes
 */
const express = require('express');
const Medicine = require('../models/Medicine');
const ApiError = require('../utils/ApiError');

const router = express.Router();

/**
 * GET /api/v1/medicines
 * List medicines with pagination.
 * Query params: ?page=1&limit=20
 */
router.get('/', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [medicines, total] = await Promise.all([
            Medicine.find().sort({ name: 1 }).skip(skip).limit(limit),
            Medicine.countDocuments(),
        ]);

        res.json({
            success: true,
            count: medicines.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            medicines,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/medicines/search?q=paracetamol
 * Full-text search across name, genericName, category, relatedConditions.
 */
router.get('/search', async (req, res, next) => {
    try {
        const query = req.query.q;
        if (!query || query.trim().length === 0) {
            return next(ApiError.badRequest('Search query is required'));
        }

        // Try full-text search first
        let medicines = await Medicine.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(30);

        // Fallback to regex search if text search yields no results
        if (medicines.length === 0) {
            const regex = new RegExp(query, 'i');
            medicines = await Medicine.find({
                $or: [
                    { name: regex },
                    { genericName: regex },
                    { category: regex },
                    { relatedConditions: regex },
                ],
            }).limit(30);
        }

        res.json({
            success: true,
            count: medicines.length,
            medicines,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/medicines/category/:category
 * Filter medicines by category.
 */
router.get('/category/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        const medicines = await Medicine.find({
            category: new RegExp(`^${category}$`, 'i'),
        }).sort({ name: 1 });

        res.json({
            success: true,
            count: medicines.length,
            medicines,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/medicines/:id
 * Get a single medicine with populated substitute references.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const medicine = await Medicine.findById(req.params.id)
            .populate('substitutes', 'name genericName category strength priceInr');

        if (!medicine) {
            return next(ApiError.notFound('Medicine not found'));
        }

        res.json({
            success: true,
            medicine,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
