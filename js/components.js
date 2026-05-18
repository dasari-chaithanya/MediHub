/**
 * Reusable Components Logic (components.js)
 */
import { $ } from './utils.js';
import { appState, events } from './state.js';

export function initComponents() {
    initSidebar();
    initAvatarDropdown();
    initGlobalReminderModal();
    initNotifications();
}

function initSidebar() {
    const sidebar = $('#sidebar');
    const toggleBtn = $('#sidebar-toggle');

    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

function initAvatarDropdown() {
    const btn = $('#avatar-toggle');
    const menu = $('#avatar-menu');

    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            const isExpanded = menu.classList.contains('active');
            btn.setAttribute('aria-expanded', isExpanded);
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Logout
        const logoutBtn = menu.querySelector('.dropdown-item.danger');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                appState.logout();
            });
        }
    }
}

function initGlobalReminderModal() {
    const hourWheel = $('#tp-hour-wheel');
    const minuteWheel = $('#tp-minute-wheel');

    // Populate Wheels with spacer padding (30px top, 30px bottom)
    if (hourWheel) {
        let hHtml = '<div style="height: 30px;"></div>';
        for(let i=1; i<=12; i++) {
            hHtml += `<div class="tp-item" style="height: 30px; line-height: 30px; scroll-snap-align: center; color: var(--text-secondary); transition: all 0.2s;">${String(i).padStart(2, '0')}</div>`;
        }
        hHtml += '<div style="height: 30px;"></div>';
        hourWheel.innerHTML = hHtml;
    }

    if (minuteWheel) {
        let mHtml = '<div style="height: 30px;"></div>';
        ['00', '15', '30', '45'].forEach(m => {
            mHtml += `<div class="tp-item" style="height: 30px; line-height: 30px; scroll-snap-align: center; color: var(--text-secondary); transition: all 0.2s;">${m}</div>`;
        });
        mHtml += '<div style="height: 30px;"></div>';
        minuteWheel.innerHTML = mHtml;
    }

    // Scroll opacity/color effect
    const updateWheelGlow = (wheel) => {
        if (!wheel) return;
        const items = wheel.querySelectorAll('.tp-item');
        const center = wheel.scrollTop + (wheel.clientHeight / 2);
        items.forEach(item => {
            const itemCenter = item.offsetTop + (item.clientHeight / 2);
            const dist = Math.abs(center - itemCenter);
            if (dist < 15) {
                item.style.color = 'var(--primary)';
                item.style.opacity = '1';
                item.dataset.active = 'true';
            } else {
                item.style.color = 'var(--text-tertiary)';
                item.style.opacity = '0.4';
                item.dataset.active = 'false';
            }
        });
    };

    if (hourWheel) {
        hourWheel.addEventListener('scroll', () => updateWheelGlow(hourWheel));
        setTimeout(() => { hourWheel.scrollTop = 210; updateWheelGlow(hourWheel); }, 100); // Default 08
    }
    if (minuteWheel) {
        minuteWheel.addEventListener('scroll', () => updateWheelGlow(minuteWheel));
        setTimeout(() => updateWheelGlow(minuteWheel), 100);
    }

    // AM/PM Toggle
    let ampm = 'AM';
    document.querySelectorAll('.tp-ampm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tp-ampm-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-secondary)';
            });
            e.target.classList.add('active');
            e.target.style.background = 'var(--primary)';
            e.target.style.color = 'white';
            ampm = e.target.innerText;
        });
    });

    // Type Toggle
    let type = 'Pill';
    document.querySelectorAll('.tp-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tp-type-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'var(--bg-app)';
                b.style.color = 'var(--text-secondary)';
                b.style.borderColor = 'var(--border-color)';
            });
            e.target.classList.add('active');
            e.target.style.background = 'rgba(20,184,166,0.1)';
            e.target.style.color = 'var(--primary)';
            e.target.style.borderColor = 'var(--primary)';
            type = e.target.dataset.type;
        });
    });

    const saveBtn = $('#modal-save-reminder');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const title = $('#modal-reminder-title').value.trim();
            const activeHour = hourWheel ? hourWheel.querySelector('.tp-item[data-active="true"]')?.innerText || '08' : '08';
            const activeMin = minuteWheel ? minuteWheel.querySelector('.tp-item[data-active="true"]')?.innerText || '00' : '00';
            const timeFormatted = `${activeHour}:${activeMin} ${ampm}`;

            if (!title) {
                alert('Please enter medicine/task name.');
                return;
            }

            appState.addReminder({
                title,
                time: timeFormatted,
                type,
                dosage: '1 dose'
            });

            // Reset and close
            $('#modal-reminder-title').value = '';
            $('#add-reminder-modal').style.display = 'none';
        });
    }
}

function initNotifications() {
    const renderNotifications = () => {
        const list = $('#notification-list');
        const trigger = $('#notification-trigger');
        if (!list) return;

        const timeline = appState.getState().timeline;
        if (!timeline || timeline.length === 0) {
            list.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-tertiary); font-size: 13px;">No new notifications</div>';
            if (trigger) trigger.querySelector('.notification-badge').style.display = 'none';
            return;
        }

        if (trigger) trigger.querySelector('.notification-badge').style.display = 'block';

        list.innerHTML = timeline.slice(0, 5).map(event => {
            let color = 'var(--primary)';
            if (event.type === 'success') color = 'var(--success)';
            if (event.type === 'warning') color = 'var(--warning)';
            if (event.type === 'danger') color = 'var(--danger)';
            
            return `
                <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; cursor: pointer; transition: background 0.2s;" onmouseenter="this.style.background='var(--bg-hover)'" onmouseleave="this.style.background='transparent'">
                    <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%; margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 8px ${color};"></div>
                    <div>
                        <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 500; color: var(--text-primary);">${event.message}</p>
                        <span style="font-size: 11px; color: var(--text-tertiary); display: block; margin-top: 4px;">Just now</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    events.on('TIMELINE_UPDATED', renderNotifications);
    events.on('REMINDER_ADDED', renderNotifications);
    
    // Close notification panel on outside click or ESC
    const panel = $('#notification-dropdown');
    if (panel) {
        document.addEventListener('click', (e) => {
            const trigger = $('#notification-trigger');
            if (trigger && !trigger.contains(e.target) && !panel.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                panel.style.display = 'none';
                
                // Also close the add reminder modal if open
                const reminderModal = $('#add-reminder-modal');
                if (reminderModal && reminderModal.style.display !== 'none') {
                    reminderModal.style.display = 'none';
                }
            }
        });
    }

    setTimeout(renderNotifications, 500);
}
