/**
 * Toast System (toast.js)
 */
export const toast = {
    show: (message, type = 'info', duration = 3000, action = null) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;

        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'warning') iconName = 'alert-triangle';
        if (type === 'error') iconName = 'alert-circle';

        toastEl.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon"></i>
            <div class="toast-content">${message}</div>
            ${action ? `<div class="toast-action">${action.label}</div>` : ''}
        `;

        container.appendChild(toastEl);
        
        // Render lucide icon for this newly added toast
        if (window.lucide) {
            window.lucide.createIcons({
                nameAttr: 'data-lucide',
                root: toastEl
            });
        }

        // Trigger animation
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
        });

        // Handle Action Click
        if (action && action.onClick) {
            const actionBtn = toastEl.querySelector('.toast-action');
            actionBtn.addEventListener('click', () => {
                action.onClick();
                toast.dismiss(toastEl);
            });
        }

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                toast.dismiss(toastEl);
            }, duration);
        }
    },

    dismiss: (toastEl) => {
        toastEl.classList.remove('show');
        toastEl.addEventListener('transitionend', () => {
            toastEl.remove();
        });
    }
};
