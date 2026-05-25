/**
 * API Client (api-client.js)
 *
 * Thin wrapper around fetch() that:
 * - Always sends credentials (httpOnly JWT cookie)
 * - Always sends/receives JSON
 * - Throws ApiError objects on non-2xx responses
 * - Handles network failures gracefully
 */

const BASE_URL = 'https://medihub-backend-9d3i.onrender.com/api/v1';

class ApiError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

async function request(method, path, body = null) {
    const options = {
        method,
        credentials: 'include', // Sends httpOnly cookie automatically
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, options);
    } catch (networkError) {
        throw new ApiError(0, 'Cannot connect to server. The system might be waking up from sleep mode, please wait a moment and try again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && window.location.hash !== '#/auth') {
            window.dispatchEvent(new CustomEvent('auth-expired'));
        }
        throw new ApiError(response.status, data.message || 'Unknown error', data.details);
    }

    return data;
}

export const apiClient = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),

    // Auth
    auth: {
        register: (name, email, password) =>
            request('POST', '/auth/register', { name, email, password }),
        login: (email, password) =>
            request('POST', '/auth/login', { email, password }),
        me: () => request('GET', '/auth/me'),
        logout: () => request('POST', '/auth/logout'),
    },

    // Profile
    profile: {
        get: () => request('GET', '/profile'),
        update: (data) => request('PATCH', '/profile', data),
    },

    // Reminders
    reminders: {
        list: (status) => request('GET', `/reminders${status ? `?status=${status}` : ''}`),
        create: (data) => request('POST', '/reminders', data),
        update: (id, data) => request('PATCH', `/reminders/${id}`, data),
        delete: (id) => request('DELETE', `/reminders/${id}`),
        complete: (id) => request('POST', `/reminders/${id}/complete`),
    },

    // Timeline
    timeline: {
        list: (limit = 20) => request('GET', `/timeline?limit=${limit}`),
    },

    // Notifications
    notifications: {
        list: () => request('GET', '/notifications'),
        markRead: (id) => request('PATCH', `/notifications/${id}/read`),
        markAllRead: () => request('PATCH', '/notifications/read-all'),
    },

    // Health Score
    healthScore: {
        get: () => request('GET', '/health-score'),
    },

    // Medicines
    medicines: {
        list: (page = 1) => request('GET', `/medicines?page=${page}&limit=20`),
        search: (q) => request('GET', `/medicines/search?q=${encodeURIComponent(q)}`),
        byCategory: (cat) => request('GET', `/medicines/category/${encodeURIComponent(cat)}`),
        get: (id) => request('GET', `/medicines/${id}`),
    },
};
