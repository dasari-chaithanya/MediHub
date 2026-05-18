/**
 * TimelineEvent Model (models/TimelineEvent.js)
 * Auto-generated health continuity log.
 * Never created directly by frontend — always via eventService.
 */
const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
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
                'reminder_added',
                'reminder_completed',
                'reminder_missed',
                'medicine_saved',
                'profile_updated',
                'account_created',
                'health_score_changed',
            ],
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            maxlength: 255,
        },
        description: {
            type: String,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        icon: {
            type: String, // Lucide icon name
            default: 'activity',
            maxlength: 50,
        },
        severity: {
            type: String,
            enum: ['info', 'success', 'warning', 'danger', 'primary'],
            default: 'info',
        },
    },
    {
        timestamps: true, // createdAt is the event timestamp
    }
);

// Index for efficient timeline queries (newest first)
timelineEventSchema.index({ userId: 1, createdAt: -1 });

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);

module.exports = TimelineEvent;
