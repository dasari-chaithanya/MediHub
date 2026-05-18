/**
 * Reminder Model (models/Reminder.js)
 * Core medication tracking entity.
 */
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        medicineName: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true,
            maxlength: [200, 'Medicine name cannot exceed 200 characters'],
        },
        type: {
            type: String,
            enum: ['Pill', 'Injection', 'Liquid', 'Measurement'],
            default: 'Pill',
        },
        dosage: {
            type: String,
            trim: true,
            maxlength: [100, 'Dosage cannot exceed 100 characters'],
            default: '',
        },
        // Structured time storage (not a string)
        hour: {
            type: Number,
            required: [true, 'Hour is required'],
            min: [1, 'Hour must be between 1 and 12'],
            max: [12, 'Hour must be between 1 and 12'],
        },
        minute: {
            type: Number,
            required: [true, 'Minute is required'],
            min: [0, 'Minute must be between 0 and 59'],
            max: [59, 'Minute must be between 0 and 59'],
        },
        period: {
            type: String,
            enum: ['AM', 'PM'],
            required: [true, 'Period (AM/PM) is required'],
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'as_needed'],
            default: 'daily',
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'missed'],
            default: 'pending',
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Virtual: formatted time string for frontend display.
 * Returns "08:30 AM" format.
 */
reminderSchema.virtual('time').get(function () {
    const h = String(this.hour).padStart(2, '0');
    const m = String(this.minute).padStart(2, '0');
    return `${h}:${m} ${this.period}`;
});

// Include virtuals in JSON output
reminderSchema.set('toJSON', { virtuals: true });
reminderSchema.set('toObject', { virtuals: true });

// Compound index for efficient user+status queries
reminderSchema.index({ userId: 1, status: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
