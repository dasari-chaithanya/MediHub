/**
 * User Model (models/User.js)
 * Core authentication entity.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        onboarded: {
            type: Boolean,
            default: false,
        },
        preferences: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true, // Adds createdAt, updatedAt
    }
);

// --- Instance Methods ---

/**
 * Compare a candidate password against the stored hash.
 * @param {string} candidatePassword - Plain text password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Return a safe user object (no password hash).
 */
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
};

// --- Static Methods ---

/**
 * Hash a plain text password.
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 12);
};


const User = mongoose.model('User', userSchema);

module.exports = User;
