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
                        <div id="blood-select-wrapper" class="search-bar" tabindex="0" style="position: relative; width: 100%; border: 1px solid var(--border-color); background: var(--bg-surface); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s var(--ease-premium); outline: none;">
                            <input type="hidden" id="ob-blood" value="">
                            <div id="blood-trigger" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; height: 100%;">
                                <span id="blood-value" style="color: var(--text-tertiary); font-size: 14px;">Select...</span>
                                <i data-lucide="chevron-down" id="blood-icon" style="width: 16px; color: var(--text-tertiary); transition: transform 0.3s var(--ease-premium);"></i>
                            </div>
                            
                            <!-- Dropdown Panel -->
                            <div id="blood-panel" style="position: absolute; top: calc(100% + 6px); left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); opacity: 0; pointer-events: none; transform: translateY(-8px); transition: all 0.25s var(--ease-premium); z-index: 50; padding: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                                ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => `
                                    <div class="blood-option" data-value="${bg}" style="padding: 10px; border-radius: var(--radius-sm); font-size: 14px; color: var(--text-primary); text-align: center; transition: background 0.2s, color 0.2s;">
                                        ${bg}
                                    </div>
                                `).join('')}
                            </div>
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

        // Custom Dropdown Logic
        const wrapper = container.querySelector('#blood-select-wrapper');
        const trigger = container.querySelector('#blood-trigger');
        const panel = container.querySelector('#blood-panel');
        const valueSpan = container.querySelector('#blood-value');
        const hiddenInput = container.querySelector('#ob-blood');
        const icon = container.querySelector('#blood-icon');
        const options = container.querySelectorAll('.blood-option');
        let isOpen = false;

        const toggleDropdown = (open) => {
            isOpen = open !== undefined ? open : !isOpen;
            if (isOpen) {
                panel.style.opacity = '1';
                panel.style.pointerEvents = 'all';
                panel.style.transform = 'translateY(0)';
                icon.style.transform = 'rotate(180deg)';
                wrapper.style.borderColor = 'var(--primary)';
                wrapper.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
            } else {
                panel.style.opacity = '0';
                panel.style.pointerEvents = 'none';
                panel.style.transform = 'translateY(-8px)';
                icon.style.transform = 'rotate(0deg)';
                wrapper.style.borderColor = 'var(--border-color)';
                wrapper.style.boxShadow = 'none';
            }
        };

        // Hover & Focus effects
        wrapper.addEventListener('mouseenter', () => { if(!isOpen) wrapper.style.borderColor = 'var(--primary)'; });
        wrapper.addEventListener('mouseleave', () => { if(!isOpen) wrapper.style.borderColor = 'var(--border-color)'; });
        wrapper.addEventListener('focus', () => toggleDropdown(true));
        
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        // Keyboard access
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            }
            if (e.key === 'Escape' && isOpen) {
                toggleDropdown(false);
                wrapper.focus();
            }
        });

        // Options interaction
        options.forEach(opt => {
            opt.addEventListener('mouseenter', () => {
                if(opt.dataset.value !== hiddenInput.value) opt.style.background = 'var(--bg-hover)';
            });
            opt.addEventListener('mouseleave', () => {
                if(opt.dataset.value !== hiddenInput.value) opt.style.background = 'transparent';
            });

            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Reset all
                options.forEach(o => {
                    o.style.background = 'transparent';
                    o.style.color = 'var(--text-primary)';
                    o.style.fontWeight = 'normal';
                });
                
                // Set active
                opt.style.background = 'rgba(20, 184, 166, 0.1)';
                opt.style.color = 'var(--primary)';
                opt.style.fontWeight = '600';
                
                // Update value
                const val = opt.dataset.value;
                hiddenInput.value = val;
                valueSpan.textContent = val;
                valueSpan.style.color = 'var(--text-primary)';
                
                toggleDropdown(false);
            });
        });

        // Click outside to close
        document.addEventListener('click', () => {
            if (isOpen) toggleDropdown(false);
        });

    }, 0);

    return container;
}
