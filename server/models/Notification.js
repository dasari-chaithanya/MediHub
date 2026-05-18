/**
 * Notification Model (models/Notification.js)
 * Event-driven notification system.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                'reminder_completed',
                'reminder_missed',
                'reminder_due',
                'onboarding_done',
                'health_score_drop',
                'health_score_rise',
                'system',
            ],
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            maxlength: 255,
        },
        body: {
            type: String,
            default: null,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unread-first notification queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
