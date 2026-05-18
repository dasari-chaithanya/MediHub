/**
 * Reminders Module (reminders.js)
 */
import { appState, events } from '../state.js';
import { toast } from '../toast.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    container.innerHTML = `
        <div class="card-surface mb-4" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div>
                <h2>Medication Reminders</h2>
                <p>Manage your daily schedule.</p>
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('add-reminder-modal').style.display='flex'" style="padding: 12px 24px;"><i data-lucide="plus"></i> New Reminder</button>
        </div>

        <div class="bento-grid">

            <!-- List -->
            <div id="list-container" style="grid-column: 1 / -1;">
                <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                    <button class="rem-tab active" data-tab="pending" style="padding-bottom: 12px; font-weight: 600; border-bottom: 2px solid var(--primary); color: var(--text-primary); margin-bottom: -1px; background: none; transition: all 0.2s;">Upcoming</button>
                    <button class="rem-tab" data-tab="completed" style="padding-bottom: 12px; font-weight: 500; border-bottom: 2px solid transparent; color: var(--text-tertiary); margin-bottom: -1px; background: none; transition: all 0.2s;">Completed</button>
                </div>
                
                <div class="reminder-list" id="reminders-list-ui">
                    <!-- Populated dynamically -->
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const listUI = container.querySelector('#reminders-list-ui');
        let activeTab = 'pending';

        // Tab Logic
        container.querySelectorAll('.rem-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.rem-tab').forEach(b => {
                    b.classList.remove('active');
                    b.style.borderBottomColor = 'transparent';
                    b.style.color = 'var(--text-tertiary)';
                    b.style.fontWeight = '500';
                });
                const target = e.currentTarget;
                target.classList.add('active');
                target.style.borderBottomColor = 'var(--primary)';
                target.style.color = 'var(--text-primary)';
                target.style.fontWeight = '600';
                activeTab = target.dataset.tab;
                renderList();
            });
        });

        const renderList = () => {
            const allReminders = appState.getState().reminders;
            const filtered = allReminders.filter(r => r.status === activeTab);

            if (filtered.length === 0) {
                listUI.innerHTML = `
                    <div class="card-surface empty-state animate-slide-up" style="padding: 64px 24px;">
                        <i data-lucide="${activeTab === 'completed' ? 'check-square' : 'calendar-check'}" class="empty-icon" style="width: 48px; height: 48px; color: var(--border-color); margin-bottom: 16px;"></i>
                        <h3 style="margin-bottom: 8px;">${activeTab === 'completed' ? 'No completed reminders yet.' : 'Your schedule is clear.'}</h3>
                    </div>
                `;
            } else {
                listUI.innerHTML = filtered.map((r, idx) => `
                    <div class="card-surface reminder-item stagger-${(idx % 5) + 1} animate-slide-up" data-id="${r.id}" style="animation-fill-mode: both; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid ${activeTab === 'completed' ? 'var(--success)' : 'var(--primary)'}; opacity: ${activeTab === 'completed' ? '0.7' : '1'};">
                        <div class="reminder-info" style="display: flex; gap: var(--space-3); align-items: center;">
                            <div style="font-size: 24px; font-family: 'Sora', sans-serif; font-weight: 700; width: 100px; color: ${activeTab === 'completed' ? 'var(--success)' : 'var(--primary)'};">
                                ${r.time}
                            </div>
                            <div class="reminder-details">
                                <h4 style="font-size: 16px; margin-bottom: 4px; text-decoration: ${activeTab === 'completed' ? 'line-through' : 'none'};">${r.title}</h4>
                                <span class="badge" style="background: rgba(20, 184, 166, 0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 11px;">${r.frequency || 'Every day'}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: var(--space-2);">
                            ${activeTab === 'pending' ? `
                                <button class="icon-btn complete-btn" style="background: rgba(34, 197, 94, 0.1); color: var(--success);" aria-label="Mark Completed" data-id="${r.id}">
                                    <i data-lucide="check"></i>
                                </button>
                            ` : ''}
                            <button class="icon-btn danger delete-btn" aria-label="Delete Reminder" data-id="${r.id}">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            if (window.lucide) window.lucide.createIcons();

            listUI.querySelectorAll('.complete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    appState.completeReminder(id);
                    renderList();
                    toast.show(`Reminder completed. Health score updated!`, 'success');
                });
            });

            listUI.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    const reminderToRemove = filtered.find(r => r.id === id);
                    appState.removeReminder(id);
                    renderList();
                    
                    toast.show(`Deleted "${reminderToRemove.title}"`, 'warning', 5000, {
                        label: 'Undo',
                        onClick: () => {
                            appState.addReminder(reminderToRemove);
                            renderList();
                        }
                    });
                });
            });
        };

        // Event Bus Listener
        events.on('REMINDER_ADDED', () => renderList());

        renderList();

        renderList();

    }, 0);

    return container;
}
