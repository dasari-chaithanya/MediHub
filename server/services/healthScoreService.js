/**
 * Health Score Service (services/healthScoreService.js)
 * Rule-based dynamic calculation from actual behavior data.
 * NOT fake AI. NOT stored statically.
 *
 * Scoring breakdown:
 *   Adherence (60%):  completed / total reminders in last 7 days
 *   Consistency (25%): streak of consecutive days with ≥1 completion
 *   Engagement (15%):  profile completeness
 */
const Reminder = require('../models/Reminder');
const UserProfile = require('../models/UserProfile');

/**
 * Calculate health score for a given user.
 * @param {string} userId - User's ObjectId
 * @returns {object} Score breakdown
 */
async function calculateHealthScore(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // --- 1. ADHERENCE (60% weight) ---
    // Ratio of completed vs total reminders in the last 7 days
    const recentReminders = await Reminder.find({
        userId,
        createdAt: { $gte: sevenDaysAgo },
    });

    const totalReminders = recentReminders.length;
    const completedReminders = recentReminders.filter(r => r.status === 'completed').length;
    const missedReminders = recentReminders.filter(r => r.status === 'missed').length;

    let adherence = 100; // Default if no reminders
    if (totalReminders > 0) {
        adherence = Math.round((completedReminders / totalReminders) * 100);
    }

    // --- 2. CONSISTENCY (25% weight) ---
    // Count consecutive days (from today backward) with at least one completion
    const completedByDay = {};
    recentReminders
        .filter(r => r.status === 'completed' && r.completedAt)
        .forEach(r => {
            const dayKey = r.completedAt.toISOString().split('T')[0];
            completedByDay[dayKey] = true;
        });

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dayKey = checkDate.toISOString().split('T')[0];
        if (completedByDay[dayKey]) {
            streak++;
        } else if (i > 0) {
            break; // Streak broken
        }
    }
    const consistency = Math.round((streak / 7) * 100);

    // --- 3. ENGAGEMENT (15% weight) ---
    // Profile completeness check
    let engagement = 30; // Base score for having an account
    try {
        const profile = await UserProfile.findOne({ userId });
        if (profile) {
            if (profile.age) engagement += 15;
            if (profile.height) engagement += 15;
            if (profile.weight) engagement += 15;
            if (profile.bloodGroup) engagement += 10;
            if (profile.notificationPreferences?.reminders) engagement += 15;
        }
    } catch {
        // Profile might not exist yet
    }
    engagement = Math.min(100, engagement);

    // --- COMPOSITE SCORE ---
    const score = Math.round(
        adherence * 0.6 +
        consistency * 0.25 +
        engagement * 0.15
    );

    // --- INSIGHT GENERATION ---
    let insight = '';
    let trend = 'stable';

    if (adherence >= 90) {
        insight = 'Excellent medication adherence this week.';
        trend = 'up';
    } else if (adherence >= 70) {
        insight = `You completed ${completedReminders} of ${totalReminders} reminders. Room for improvement.`;
    } else if (adherence >= 50) {
        insight = `Adherence dropped to ${adherence}%. Try setting phone alarms alongside MediHub reminders.`;
        trend = 'down';
    } else if (totalReminders > 0) {
        insight = `Only ${completedReminders} of ${totalReminders} reminders completed. Consistency is key for treatment efficacy.`;
        trend = 'down';
    } else {
        insight = 'No reminders set this week. Add your medications to start tracking.';
    }

    if (missedReminders > 0 && adherence >= 70) {
        insight += ` You missed ${missedReminders} reminder${missedReminders > 1 ? 's' : ''}.`;
    }

    return {
        score: Math.min(100, Math.max(0, score)),
        breakdown: {
            adherence,
            consistency,
            engagement,
        },
        stats: {
            totalReminders,
            completedReminders,
            missedReminders,
            streak,
        },
        insight,
        trend,
    };
}

module.exports = { calculateHealthScore };
