/**
 * Onboarding Module (onboarding.js)
 * Saves health profile to real backend via appState.completeOnboarding()
 */
import { appState } from '../state.js';
import { toast } from '../toast.js';

export async function render() {
    const user = appState.getState().user;

    const container = document.createElement('div');
    container.className = 'animate-fade-in';
    container.style.display = 'flex';
    container.style.height = '100vh';
    container.style.width = '100%';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.background = 'var(--bg-app)';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '9990';

    container.innerHTML = `
        <div class="card-surface" style="width: 100%; max-width: 500px; padding: var(--space-4); box-shadow: var(--shadow-lg);">
            <div style="text-align: center; margin-bottom: var(--space-4);">
                <div class="action-icon-wrap" style="margin: 0 auto var(--space-2); width: 64px; height: 64px; background: rgba(20, 184, 166, 0.1); color: var(--primary);">
                    <i data-lucide="heart-pulse" style="width: 32px; height: 32px;"></i>
                </div>
                <h2>Welcome, ${user?.name || 'there'}!</h2>
                <p style="color: var(--text-secondary);">Let's personalize your health experience.</p>
            </div>

            <!-- Error Banner -->
            <div id="ob-error" style="display: none; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: var(--space-3); font-size: 13px; color: var(--danger);"></div>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Age</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-surface); border-radius: var(--radius-md);">
                            <input type="number" id="ob-age" placeholder="25" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Blood Group (Optional)</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-surface); border-radius: var(--radius-md);">
                            <select id="ob-blood" style="width: 100%; padding: 12px; background: transparent; outline: none; border: none; color: var(--text-primary);">
                                <option value="">Select...</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Height (cm)</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-surface); border-radius: var(--radius-md);">
                            <input type="number" id="ob-height" placeholder="175" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Weight (kg)</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-surface); border-radius: var(--radius-md);">
                            <input type="number" id="ob-weight" placeholder="70" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                </div>
            </div>

            <button class="btn btn-primary mt-4" id="ob-submit" style="width: 100%; padding: 14px; font-size: 16px; justify-content: center;">Complete Setup</button>
            <div style="text-align: center; margin-top: var(--space-3);">
                <p style="font-size: 12px; color: var(--text-tertiary);"><i data-lucide="lock" style="width: 12px; vertical-align: middle;"></i> Your health data is stored securely and never shared externally.</p>
            </div>
        </div>
    `;

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();

        const btn = container.querySelector('#ob-submit');
        const errorEl = container.querySelector('#ob-error');

        btn.addEventListener('click', async () => {
            errorEl.style.display = 'none';

            const age = parseFloat(container.querySelector('#ob-age').value) || null;
            const height = parseFloat(container.querySelector('#ob-height').value) || null;
            const weight = parseFloat(container.querySelector('#ob-weight').value) || null;
            const blood = container.querySelector('#ob-blood').value || null;

            btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="width:16px;height:16px;"></i> Saving...';
            if (window.lucide) window.lucide.createIcons();
            btn.disabled = true;

            try {
                await appState.completeOnboarding({ age, height, weight, blood });

                container.style.opacity = 0;
                container.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    window.location.hash = '#/dashboard';
                }, 400);
            } catch (err) {
                errorEl.textContent = err.message || 'Failed to save profile. Please try again.';
                errorEl.style.display = 'block';
                btn.innerHTML = 'Complete Setup';
                btn.disabled = false;
            }
        });
    }, 0);

    return container;
}
