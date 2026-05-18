/**
 * Settings Module (settings.js)
 */

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1 card-surface';

    container.innerHTML = `
        <h2 class="mb-4">Settings</h2>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
                <h4 style="margin-bottom: var(--space-2);">Notifications</h4>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);">
                    <span>Push Notifications</span>
                    <input type="checkbox" checked style="accent-color: var(--primary); transform: scale(1.2);">
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);">
                    <span>Email Digests</span>
                    <input type="checkbox" style="accent-color: var(--primary); transform: scale(1.2);">
                </div>
            </div>

            <div>
                <h4 style="margin-bottom: var(--space-2);">Privacy & Security</h4>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);">
                    <span>Share anonymous usage data</span>
                    <input type="checkbox" checked style="accent-color: var(--primary); transform: scale(1.2);">
                </div>
                <div style="padding: var(--space-2) 0;">
                    <button class="btn btn-outline" style="color: var(--danger); border-color: var(--danger);">Export My Data</button>
                </div>
            </div>
        </div>
    `;

    return container;
}
