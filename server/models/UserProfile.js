/**
 * UserProfile Model (models/UserProfile.js)
 * Extended profile data, separate from auth credentials.
 * Auto-created on registration, updated during onboarding.
 */
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        age: {
            type: Number,
            min: [1, 'Age must be at least 1'],
            max: [150, 'Age cannot exceed 150'],
            default: null,
        },
        height: {
            type: Number, // in cm
            min: [30, 'Height must be at least 30cm'],
            max: [300, 'Height cannot exceed 300cm'],
            default: null,
        },
        weight: {
            type: Number, // in kg
            min: [1, 'Weight must be at least 1kg'],
            max: [500, 'Weight cannot exceed 500kg'],
            default: null,
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
            default: null,
        },
        calmMode: {
            type: Boolean,
            default: true,
        },
        notificationPreferences: {
            type: {
                reminders: { type: Boolean, default: true },
                health: { type: Boolean, default: true },
                system: { type: Boolean, default: true },
            },
            default: () => ({ reminders: true, health: true, system: true }),
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Compute BMI from stored height/weight.
 * Returns null if either value is missing.
 */
userProfileSchema.virtual('bmi').get(function () {
    if (!this.height || !this.weight) return null;
    return parseFloat((this.weight / ((this.height / 100) ** 2)).toFixed(1));
});

// Include virtuals in JSON/Object output
userProfileSchema.set('toJSON', { virtuals: true });
userProfileSchema.set('toObject', { virtuals: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
