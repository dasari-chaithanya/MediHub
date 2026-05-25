/**
 * Shared UI Components (ui.js)
 * Reusable, logic-free UI generators for a consistent SaaS aesthetic.
 */

/**
 * Creates an iOS-style toggle switch HTML string.
 * @param {string} id - Unique ID for the input
 * @param {boolean} checked - Initial state
 * @returns {string} HTML string
 */
export function createToggleHTML(id, checked = false) {
    return `
        <label class="toggle-switch" for="${id}">
            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
            <span class="toggle-slider"></span>
        </label>
    `;
}

/**
 * Creates an animated circular progress ring HTML string.
 * @param {number} radius - Radius of the circle
 * @param {number} percentage - 0 to 100
 * @param {string} centerHTML - HTML to place inside the ring
 * @returns {string} HTML string
 */
export function createProgressRingHTML(radius, percentage, centerHTML = '') {
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return `
        <div class="progress-ring" style="width: ${radius * 2}px; height: ${radius * 2}px;">
            <svg height="${radius * 2}" width="${radius * 2}">
                <circle
                    class="progress-ring-circle-bg"
                    r="${normalizedRadius}"
                    cx="${radius}"
                    cy="${radius}"
                />
                <circle
                    class="progress-ring-circle"
                    stroke-dasharray="${circumference} ${circumference}"
                    style="stroke-dashoffset: ${circumference};" 
                    r="${normalizedRadius}"
                    cx="${radius}"
                    cy="${radius}"
                />
            </svg>
            <div class="progress-ring-text">
                ${centerHTML}
            </div>
            <script>
                // Self-executing animation for the ring
                setTimeout(() => {
                    const circle = document.currentScript.previousElementSibling.previousElementSibling.querySelector('.progress-ring-circle');
                    if(circle) circle.style.strokeDashoffset = '${strokeDashoffset}';
                }, 100);
            </script>
        </div>
    `;
}

/**
 * Creates a restrained, Stripe-like empty state HTML string.
 * @param {string} iconName - Lucide icon name
 * @param {string} title - Main heading
 * @param {string} description - Subtext
 * @param {string} actionHTML - Optional button HTML
 * @returns {string} HTML string
 */
export function createEmptyStateHTML(iconName, title, description, actionHTML = '') {
    return `
        <div class="saas-empty-state">
            <i data-lucide="${iconName}"></i>
            <h3>${title}</h3>
            <p>${description}</p>
            ${actionHTML ? `<div class="mt-4">${actionHTML}</div>` : ''}
        </div>
    `;
}
