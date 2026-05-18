/**
 * Request Validation Middleware (middleware/validate.js)
 * Wraps Joi schemas for route-level input validation.
 */
const ApiError = require('../utils/ApiError');

/**
 * Creates a middleware that validates req.body against a Joi schema.
 * @param {import('joi').Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,    // Report all errors, not just the first
            stripUnknown: true,   // Remove unknown fields silently
            errors: {
                wrap: { label: false }, // Cleaner error messages
            },
        });

        if (error) {
            const details = error.details.map(d => d.message);
            return next(ApiError.badRequest('Validation failed', details));
        }

        // Replace body with validated/sanitized value
        req.body = value;
        next();
    };
};

module.exports = validate;
