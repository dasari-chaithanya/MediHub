/**
 * Event Service (services/eventService.js)
 * Central orchestrator for side-effects across systems.
 *
 * When a domain action happens (e.g. reminder completed),
 * the route calls eventService which coordinates:
 * timeline entries, notifications, score recalculations.
 *
 * This is built incrementally — models are required lazily
 * to avoid circular dependency issues.
 */

class EventService {
    constructor() {
        this.handlers = {};
    }

    /**
     * Register a handler for an event type.
     * @param {string} event - Event name
     * @param {Function} handler - Async handler function
     */
    on(event, handler) {
        if (!this.handlers[event]) this.handlers[event] = [];
        this.handlers[event].push(handler);
    }

    /**
     * Emit an event, triggering all registered handlers.
     * Errors in individual handlers are logged but don't block others.
     * @param {string} event - Event name
     * @param {object} payload - Event data
     */
    async emit(event, payload) {
        const handlers = this.handlers[event] || [];
        if (handlers.length === 0) return;

        console.log(`[EVENT] ${event}`, payload?.userId ? `(user: ${payload.userId})` : '');

        const results = await Promise.allSettled(
            handlers.map(handler => handler(payload))
        );

        // Log failures without crashing
        results.forEach((result, idx) => {
            if (result.status === 'rejected') {
                console.error(`[EVENT] Handler ${idx} for "${event}" failed:`, result.reason?.message);
            }
        });
    }
}

// Singleton instance
const eventService = new EventService();

// --- Register Built-in Event Handlers ---

// These handlers use lazy requires to avoid circular dependencies
// and are safe to call even before all models exist.

/**
 * REMINDER_COMPLETED
 * → Create timeline entry
 * → Create notification
 */
eventService.on('REMINDER_COMPLETED', async ({ reminder, userId }) => {
    try {
        const TimelineEvent = require('../models/TimelineEvent');
        await TimelineEvent.create({
            userId,
            type: 'reminder_completed',
            title: `Completed: ${reminder.medicineName}`,
            description: `${reminder.type} taken at ${reminder.time}`,
            icon: 'check-circle',
            severity: 'success',
        });
    } catch (e) {
        // TimelineEvent model may not exist yet during early phases
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }

    try {
        const Notification = require('../models/Notification');
        await Notification.create({
            userId,
            type: 'reminder_completed',
            title: `You completed ${reminder.medicineName}`,
            body: `${reminder.type} marked as taken.`,
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }
});

/**
 * REMINDER_ADDED
 * → Create timeline entry
 */
eventService.on('REMINDER_ADDED', async ({ reminder, userId }) => {
    try {
        const TimelineEvent = require('../models/TimelineEvent');
        await TimelineEvent.create({
            userId,
            type: 'reminder_added',
            title: `New reminder: ${reminder.medicineName}`,
            description: `Scheduled for ${reminder.time}`,
            icon: 'bell-plus',
            severity: 'primary',
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }
});

/**
 * REMINDER_MISSED
 * → Create timeline entry
 * → Create warning notification
 */
eventService.on('REMINDER_MISSED', async ({ reminder, userId }) => {
    try {
        const TimelineEvent = require('../models/TimelineEvent');
        await TimelineEvent.create({
            userId,
            type: 'reminder_missed',
            title: `Missed: ${reminder.medicineName}`,
            description: `Scheduled for ${reminder.time}`,
            icon: 'alert-triangle',
            severity: 'warning',
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }

    try {
        const Notification = require('../models/Notification');
        await Notification.create({
            userId,
            type: 'reminder_missed',
            title: `You missed ${reminder.medicineName}`,
            body: `Scheduled for ${reminder.time}. Try to stay consistent.`,
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }
});

/**
 * ACCOUNT_CREATED
 * → Welcome timeline entry
 * → Welcome notification
 */
eventService.on('ACCOUNT_CREATED', async ({ userId, name }) => {
    try {
        const TimelineEvent = require('../models/TimelineEvent');
        await TimelineEvent.create({
            userId,
            type: 'account_created',
            title: 'Welcome to MediHub',
            description: `Account created for ${name}`,
            icon: 'user-check',
            severity: 'success',
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }

    try {
        const Notification = require('../models/Notification');
        await Notification.create({
            userId,
            type: 'system',
            title: 'Welcome to MediHub!',
            body: 'Start by setting up your profile and adding your first medication reminder.',
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }
});

/**
 * PROFILE_UPDATED
 * → Create timeline entry
 */
eventService.on('PROFILE_UPDATED', async ({ userId }) => {
    try {
        const TimelineEvent = require('../models/TimelineEvent');
        await TimelineEvent.create({
            userId,
            type: 'profile_updated',
            title: 'Profile updated',
            icon: 'user-cog',
            severity: 'info',
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }
});

module.exports = eventService;
