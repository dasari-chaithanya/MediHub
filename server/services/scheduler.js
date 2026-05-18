/**
 * Scheduler Service (services/scheduler.js)
 * Runs a cron job every minute to:
 * 1. Detect due reminders and emit REMINDER_DUE
 * 2. Mark past-due reminders as missed and emit REMINDER_MISSED
 */
const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const eventService = require('./eventService');

/**
 * Convert 12h reminder time to 24h for comparison.
 */
function to24Hour(hour, minute, period) {
    let h = hour;
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return { h, m: minute };
}

/**
 * Start the scheduler.
 * Runs every minute and checks all pending reminders.
 */
function startScheduler() {
    console.log('[SCHEDULER] Started — checking reminders every minute');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Find all pending daily reminders
            const pendingReminders = await Reminder.find({
                status: 'pending',
                frequency: 'daily',
            });

            for (const reminder of pendingReminders) {
                const { h, m } = to24Hour(reminder.hour, reminder.minute, reminder.period);

                // Check if reminder is due RIGHT NOW (within this minute)
                if (h === currentHour && m === currentMinute) {
                    console.log(`[SCHEDULER] Reminder due: ${reminder.medicineName} for user ${reminder.userId}`);

                    await eventService.emit('REMINDER_DUE', {
                        reminder: reminder.toJSON(),
                        userId: reminder.userId,
                    });
                }

                // Check if reminder was missed (time has passed today, still pending)
                // Only mark missed if more than 30 minutes past scheduled time
                const scheduledMinutes = h * 60 + m;
                const currentMinutes = currentHour * 60 + currentMinute;
                const minutesPastDue = currentMinutes - scheduledMinutes;

                if (minutesPastDue > 30 && minutesPastDue < 120) {
                    // Only mark missed once (within 30-120 min window)
                    console.log(`[SCHEDULER] Reminder missed: ${reminder.medicineName} for user ${reminder.userId}`);

                    reminder.status = 'missed';
                    await reminder.save();

                    await eventService.emit('REMINDER_MISSED', {
                        reminder: reminder.toJSON(),
                        userId: reminder.userId,
                    });
                }
            }
        } catch (error) {
            console.error('[SCHEDULER] Error:', error.message);
        }
    });
}

// Register REMINDER_DUE event handler → create "due" notification
eventService.on('REMINDER_DUE', async ({ reminder, userId }) => {
    try {
        const Notification = require('../models/Notification');
        await Notification.create({
            userId,
            type: 'reminder_due',
            title: `Time for ${reminder.medicineName}`,
            body: `Your ${reminder.type} is scheduled for ${reminder.time}.`,
        });
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
    }
});

module.exports = { startScheduler };
