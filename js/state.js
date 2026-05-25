/**
 * State Management & Event Architecture (state.js)
 *
 * Rewritten for Phase 9: all data now comes from the real backend.
 * Frontend modules use appState the same way as before — only the
 * internals changed (localStorage → real API calls).
 */
import { storage } from './utils.js';
import { apiClient } from './api-client.js';

// --- Lightweight Event Bus (unchanged) ---
class EventBus {
    constructor() { this.listeners = {}; }
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }
    emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    }
}
export const events = new EventBus();

// --- Centralized App State ---
class AppState {
    constructor() {
        this.state = {
            isInitialized: false,
            needsAuth: true,
            needsOnboarding: false,
            user: null,
            profile: null,
            reminders: [],
            timeline: [],
            notifications: [],
            unreadCount: 0,
            healthScore: null,
            theme: storage.get('mh_theme', 'calm'),
            currentRoute: 'dashboard',
        };
        this.stateListeners = [];
    }

    // ---- Init ----

    async init() {
        try {
            const token = localStorage.getItem('mh_token');
            if (!token) throw new Error('No token found');

            // Try fetching current user — if this succeeds, JWT is valid
            const data = await apiClient.auth.me();
            const user = data.user;

            this.state.user = user;
            this.state.needsAuth = false;
            this.state.needsOnboarding = !user.onboarded;

            if (user.onboarded) {
                // Load all data in parallel for fast startup
                await this._loadAllData();
            }
        } catch (err) {
            // 401 = not logged in, or no token
            localStorage.removeItem('mh_token');
            this.state.needsAuth = true;
            this.state.needsOnboarding = false;
            this.state.user = null;
        }

        this.state.isInitialized = true;
        this._notify();
        return this.state;
    }

    async _loadAllData() {
        try {
            const [remindersRes, timelineRes, notifRes, scoreRes, profileRes] = await Promise.allSettled([
                apiClient.reminders.list(),
                apiClient.timeline.list(10),
                apiClient.notifications.list(),
                apiClient.healthScore.get(),
                apiClient.profile.get(),
            ]);

            if (remindersRes.status === 'fulfilled') {
                this.state.reminders = remindersRes.value.reminders || [];
            }
            if (timelineRes.status === 'fulfilled') {
                this.state.timeline = timelineRes.value.events || [];
            }
            if (notifRes.status === 'fulfilled') {
                this.state.notifications = notifRes.value.notifications || [];
                this.state.unreadCount = notifRes.value.unreadCount || 0;
            }
            if (scoreRes.status === 'fulfilled') {
                this.state.healthScore = scoreRes.value || null;
            }
            if (profileRes.status === 'fulfilled') {
                this.state.profile = profileRes.value.profile || null;
            }
        } catch (err) {
            console.error('[AppState] Error loading data:', err);
        }
    }

    // ---- State Getters / Setters ----

    getState() { return { ...this.state }; }

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this._notify();
    }

    subscribe(listener) {
        this.stateListeners.push(listener);
        return () => {
            this.stateListeners = this.stateListeners.filter(l => l !== listener);
        };
    }

    _notify() {
        this.stateListeners.forEach(listener => listener(this.state));
    }

    // ---- Theme (local only — no backend needed) ----

    setTheme(mode) {
        this.setState({ theme: mode });
        storage.set('mh_theme', mode);
    }

    // ---- Auth Actions ----

    async login(email, password) {
        const data = await apiClient.auth.login(email, password);
        const user = data.user;

        if (data.token) {
            localStorage.setItem('mh_token', data.token);
        }

        this.state.user = user;
        this.state.needsAuth = false;
        this.state.needsOnboarding = !user.onboarded;

        if (user.onboarded) {
            await this._loadAllData();
            this._notify();
            window.location.hash = '#/dashboard';
        } else {
            this._notify();
            window.location.hash = '#/onboarding';
        }
    }

    async register(name, email, password) {
        const data = await apiClient.auth.register(name, email, password);
        const user = data.user;

        if (data.token) {
            localStorage.setItem('mh_token', data.token);
        }

        this.state.user = user;
        this.state.needsAuth = false;
        this.state.needsOnboarding = !user.onboarded;

        this._notify();
        window.location.hash = '#/onboarding';
    }

    async logout() {
        try {
            await apiClient.auth.logout();
        } catch (_) { /* ignore — clear state anyway */ }

        localStorage.removeItem('mh_token');

        this.state = {
            ...this.state,
            user: null,
            profile: null,
            reminders: [],
            timeline: [],
            notifications: [],
            unreadCount: 0,
            healthScore: null,
            needsAuth: true,
            needsOnboarding: false,
        };
        this._notify();
        window.location.hash = '#/auth';
        window.location.reload();
    }

    // ---- Onboarding ----

    async completeOnboarding(profileData) {
        // Save profile data to backend
        await apiClient.profile.update({
            age: profileData.age || null,
            height: profileData.height || null,
            weight: profileData.weight || null,
            bloodGroup: profileData.blood || null,
        });

        // Refresh user (onboarded flag is now true)
        const userData = await apiClient.auth.me();
        this.state.user = userData.user;
        this.state.needsOnboarding = false;

        // Load all data now that onboarding is done
        await this._loadAllData();
        this._notify();

        events.emit('ONBOARDING_COMPLETED');
    }

    // ---- Reminders ----

    async addReminder(reminderData) {
        // Parse time string "08:30 AM" back to structured fields
        const { hour, minute, period } = parseTimeString(reminderData.time);

        const data = await apiClient.reminders.create({
            medicineName: reminderData.title || reminderData.medicineName,
            type: reminderData.type || 'Pill',
            dosage: reminderData.dosage || '',
            hour,
            minute,
            period,
            frequency: reminderData.frequency || 'daily',
        });

        // Refresh reminder list from server (ensures server-side data)
        const listData = await apiClient.reminders.list();
        this.setState({ reminders: listData.reminders || [] });

        events.emit('REMINDER_ADDED', data.reminder);
    }

    async removeReminder(id) {
        await apiClient.reminders.delete(id);

        const newReminders = this.state.reminders.filter(r => r._id !== id && r.id !== id);
        this.setState({ reminders: newReminders });

        events.emit('REMINDER_REMOVED', id);
    }

    async completeReminder(id) {
        await apiClient.reminders.complete(id);

        // Update locally without refetch for instant UI
        const newReminders = this.state.reminders.map(r =>
            (r._id === id || r.id === id) ? { ...r, status: 'completed' } : r
        );
        this.setState({ reminders: newReminders });

        // Refresh timeline and notifications (server created them via event cascade)
        setTimeout(async () => {
            try {
                const [tlRes, notifRes, scoreRes] = await Promise.all([
                    apiClient.timeline.list(10),
                    apiClient.notifications.list(),
                    apiClient.healthScore.get(),
                ]);
                this.setState({
                    timeline: tlRes.events || [],
                    notifications: notifRes.notifications || [],
                    unreadCount: notifRes.unreadCount || 0,
                    healthScore: scoreRes,
                });
                events.emit('TIMELINE_UPDATED');
                events.emit('NOTIFICATIONS_UPDATED', this.state.unreadCount);
                events.emit('HEALTH_SCORE_UPDATED', scoreRes?.score);
            } catch (e) { /* silent */ }
        }, 300);

        events.emit('REMINDER_COMPLETED', id);
    }

    // ---- Notifications ----

    async markAllNotificationsRead() {
        await apiClient.notifications.markAllRead();
        const newNotifs = this.state.notifications.map(n => ({ ...n, read: true }));
        this.setState({ notifications: newNotifs, unreadCount: 0 });
        events.emit('NOTIFICATIONS_UPDATED', 0);
    }

    async refreshNotifications() {
        const data = await apiClient.notifications.list();
        this.setState({
            notifications: data.notifications || [],
            unreadCount: data.unreadCount || 0,
        });
        events.emit('NOTIFICATIONS_UPDATED', data.unreadCount || 0);
    }

    // ---- Timeline (legacy compat — used by old code) ----
    async addTimelineEvent(message, icon, type = 'info') {
        // Timeline is now created on server via event cascade — this is a no-op
        // but kept for compatibility with any remaining references
        console.debug('[AppState] addTimelineEvent called (server handles this now)');
    }

    // ---- Health Score ----
    async recalculateHealthScore() {
        const data = await apiClient.healthScore.get();
        this.setState({ healthScore: data });
        events.emit('HEALTH_SCORE_UPDATED', data?.score);
    }
}

// --- Helper: Parse "08:30 AM" → { hour: 8, minute: 30, period: "AM" } ---
function parseTimeString(timeStr) {
    if (!timeStr) return { hour: 8, minute: 0, period: 'AM' };
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hour: 8, minute: 0, period: 'AM' };
    return {
        hour: parseInt(match[1]),
        minute: parseInt(match[2]),
        period: match[3].toUpperCase(),
    };
}

export const appState = new AppState();
