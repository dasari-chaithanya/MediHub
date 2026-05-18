/**
 * Utilities (utils.js)
 */

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }
};

/**
 * Restrained Ripple Effect for Primary Actions
 */
export function attachRippleEffect() {
    document.addEventListener('mousedown', function(e) {
        const target = e.target.closest('.btn-primary, .card-action, .cmd-item');
        if (!target) return;

        target.classList.add('ripple-container');
        const rect = target.getBoundingClientRect();
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 500);
    });
}

export const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export async function fetchMockData(fileName) {
    try {
        const response = await fetch(`data/${fileName}`);
        return await response.json();
    } catch (e) {
        console.error(`Failed to load ${fileName}`, e);
        return null;
    }
}
