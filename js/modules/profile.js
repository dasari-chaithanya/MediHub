/**
 * Profile Module (profile.js)
 * Consolidated Profile & Settings with restrained SaaS UI.
 */
import { appState } from '../state.js';
import { toast } from '../toast.js';
import { createToggleHTML } from '../components/ui.js';

export async function render() {
    const state = appState.getState();
    const user = state.user || {};
    
    // Calculate Profile Completion
    let completionScore = 0;
    if (user.name) completionScore += 25;
    if (user.email) completionScore += 25;
    if (user.height && user.weight) completionScore += 25;
    if (user.blood) completionScore += 25;

    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-4);">
            <div>
                <h2 style="color: var(--text-primary); margin-bottom: 4px;">Account Settings</h2>
                <p style="color: var(--text-secondary); margin: 0;">Manage your identity, health profile, and preferences securely.</p>
            </div>
            <div style="text-align: right; background: var(--bg-surface); padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Profile Completion</div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 120px; height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${completionScore}%; background: ${completionScore === 100 ? 'var(--success)' : 'var(--primary)'}; transition: width 1s var(--ease-premium);"></div>
                    </div>
                    <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${completionScore}%</span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 240px 1fr; gap: var(--space-4); align-items: start;">
            <!-- Left Sidebar Navigation -->
            <div style="position: sticky; top: var(--space-4); display: flex; flex-direction: column; gap: 4px;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--text-tertiary); margin: 0 0 8px 12px; letter-spacing: 1px;">Profile</div>
                <button class="prof-nav-btn active" data-section="identity"><i data-lucide="user"></i> Identity</button>
                <button class="prof-nav-btn" data-section="health"><i data-lucide="activity"></i> Health Profile</button>
                
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--text-tertiary); margin: 16px 0 8px 12px; letter-spacing: 1px;">Settings</div>
                <button class="prof-nav-btn" data-section="prefs"><i data-lucide="sliders"></i> Preferences</button>
                <button class="prof-nav-btn" data-section="security"><i data-lucide="shield"></i> Security</button>
            </div>

            <!-- Right Content Panels -->
            <div id="prof-panels-container" style="position: relative;">
                
                <!-- Section A: Identity -->
                <div class="card-surface prof-panel active" id="panel-identity">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0; font-size: 18px;">Identity</h3>
                        <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 13px;">Edit Profile</button>
                    </div>
                    <div style="display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-4);">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--bg-hover); position: relative; border: 1px solid var(--border-color);">
                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                            <div style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: var(--primary); border-radius: 50%; border: 2px solid var(--bg-surface);"></div>
                        </div>
                        <div>
                            <div style="font-size: 20px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${user.name || 'Set your name'}</div>
                            <div style="color: var(--text-secondary); font-size: 14px;">${user.email || 'Set your email'}</div>
                        </div>
                    </div>
                </div>

                <!-- Section B: Health Profile -->
                <div class="card-surface prof-panel" id="panel-health" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0; font-size: 18px;">Health Profile</h3>
                        <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 13px;">Edit Health Data</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                        <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface);">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; font-weight: 500;">Height</div>
                            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${user.height ? user.height + ' cm' : 'Not set'}</div>
                        </div>
                        <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface);">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; font-weight: 500;">Weight</div>
                            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${user.weight ? user.weight + ' kg' : 'Not set'}</div>
                        </div>
                        <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface);">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; font-weight: 500;">BMI</div>
                            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${user.bmi || 'Not calculated'}</div>
                        </div>
                        <div style="padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface);">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase; font-weight: 500;">Blood Group</div>
                            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${user.blood || 'Not set'}</div>
                        </div>
                    </div>
                </div>

                <!-- Section C: Preferences -->
                <div class="card-surface prof-panel" id="panel-prefs" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0; font-size: 18px;">Preferences</h3>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px; color: var(--text-primary);">Language</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">English (US)</div>
                            </div>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;">Change</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px; color: var(--text-primary);">Push Notifications</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Receive alerts for medication reminders.</div>
                            </div>
                            ${createToggleHTML('pref-push', true)}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px; color: var(--text-primary);">Email Digests</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Weekly summary of your health activity.</div>
                            </div>
                            ${createToggleHTML('pref-email', false)}
                        </div>
                    </div>
                </div>

                <!-- Section D: Security -->
                <div class="card-surface prof-panel" id="panel-security" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0; font-size: 18px;">Security</h3>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px; color: var(--text-primary);">Password</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Last changed 3 months ago</div>
                            </div>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;">Update</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px; color: var(--text-primary);">Share Anonymous Data</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Help us improve MediHub.</div>
                            </div>
                            ${createToggleHTML('pref-data', true)}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px; color: var(--danger);">Data Management</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Export or delete your account.</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;">Export</button>
                                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px; color: var(--danger); border-color: rgba(239, 68, 68, 0.3);">Sign Out All</button>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
        
        <!-- Editable Slide Panel Modal with Focus Trap -->
        <div id="prof-slide-modal" style="position: fixed; top: 0; right: -450px; width: min(450px, 92vw); height: 100vh; background: var(--bg-surface); z-index: var(--z-modal); box-shadow: -10px 0 30px rgba(0,0,0,0.05); transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1); border-left: 1px solid var(--border-color); display: flex; flex-direction: column;" role="dialog" aria-modal="true" aria-label="Edit Profile Information">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Edit Information</h3>
                <button class="icon-btn" id="prof-modal-close" aria-label="Close edit panel" style="border: 1px solid var(--border-color);"><i data-lucide="x"></i></button>
            </div>
            <div style="padding: 24px; flex: 1; overflow-y: auto;">
                <div style="margin-bottom: var(--space-4);">
                    <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Name</label>
                    <input type="text" class="search-bar" value="${user.name || ''}" style="width: 100%; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                </div>
                <div style="margin-bottom: var(--space-4);">
                    <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Email</label>
                    <input type="email" class="search-bar" value="${user.email || ''}" style="width: 100%; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-5);">
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Height (cm)</label>
                        <input type="number" class="search-bar" value="${user.height || ''}" style="width: 100%; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500;">Weight (kg)</label>
                        <input type="number" class="search-bar" value="${user.weight || ''}" style="width: 100%; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                    </div>
                </div>
                <button class="btn btn-primary" id="prof-modal-save" style="width: 100%; justify-content: center; padding: 12px; font-size: 15px;">Save Changes</button>
            </div>
        </div>
        <div id="global-dim-profile" style="position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(2px); z-index: calc(var(--z-modal) - 1); opacity: 0; pointer-events: none; transition: opacity var(--duration-normal);"></div>
    `;

    setTimeout(() => {
        const navBtns = container.querySelectorAll('.prof-nav-btn');
        const panels = container.querySelectorAll('.prof-panel');
        const slideModal = container.querySelector('#prof-slide-modal');
        const closeBtn = container.querySelector('#prof-modal-close');
        const saveBtn = container.querySelector('#prof-modal-save');
        const editBtns = container.querySelectorAll('.edit-btn');
        const dimEl = container.querySelector('#global-dim-profile');
        
        let previouslyFocused = null;

        // Navigation Logic (Restrained styling)
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                navBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-secondary)';
                    b.style.background = 'transparent';
                    b.style.fontWeight = '400';
                });
                
                const target = e.currentTarget;
                target.classList.add('active');
                target.style.color = 'var(--primary)';
                target.style.background = 'rgba(20, 184, 166, 0.1)';
                target.style.fontWeight = '600';
                
                panels.forEach(p => {
                    p.style.display = 'none';
                    p.classList.remove('animate-fade-in');
                });
                
                const activePanel = container.querySelector(`#panel-${target.dataset.section}`);
                activePanel.style.display = 'block';
                activePanel.classList.add('animate-fade-in');
            });
        });

        // Initialize nav button styles
        navBtns.forEach(btn => {
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 16px';
            btn.style.borderRadius = 'var(--radius-sm)';
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.cursor = 'pointer';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '12px';
            btn.style.transition = 'all 0.2s';
            btn.style.fontSize = '14px';
        });
        const activeBtn = container.querySelector('.prof-nav-btn.active');
        if(activeBtn) {
            activeBtn.style.color = 'var(--primary)';
            activeBtn.style.background = 'rgba(20, 184, 166, 0.1)';
            activeBtn.style.fontWeight = '600';
        }

        // Slide Modal Focus Trap Logic
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                return;
            }
            if (e.key === 'Tab') {
                const focusable = slideModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        const openModal = () => {
            previouslyFocused = document.activeElement;
            slideModal.style.right = '0';
            dimEl.style.opacity = '1';
            dimEl.style.pointerEvents = 'all';
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
            document.addEventListener('keydown', handleKeyDown);
        };

        const closeModal = () => {
            slideModal.style.right = '-450px';
            dimEl.style.opacity = '0';
            dimEl.style.pointerEvents = 'none';
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
            if (previouslyFocused) {
                previouslyFocused.focus();
                previouslyFocused = null;
            }
        };

        editBtns.forEach(btn => btn.addEventListener('click', openModal));
        closeBtn.addEventListener('click', closeModal);
        dimEl.addEventListener('click', closeModal);

        saveBtn.addEventListener('click', () => {
            saveBtn.innerHTML = '<i data-lucide="loader" class="animate-pulse"></i> Saving...';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                closeModal();
                toast.show('Profile updated successfully.', 'success');
                saveBtn.innerText = 'Save Changes';
            }, 600);
        });

    }, 0);

    return container;
}
