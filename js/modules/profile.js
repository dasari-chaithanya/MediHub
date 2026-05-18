/**
 * Profile Module (profile.js)
 */
import { appState } from '../state.js';
import { toast } from '../toast.js';

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
                <h2>Profile & Settings</h2>
                <p>Manage your identity and preferences securely.</p>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Profile Completion</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 100px; height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${completionScore}%; background: ${completionScore === 100 ? 'var(--success)' : 'var(--warning)'};"></div>
                    </div>
                    <span style="font-size: 13px; font-weight: 600;">${completionScore}%</span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 250px 1fr; gap: var(--space-4); align-items: start;">
            <!-- Left Sidebar Navigation -->
            <div class="card-surface" style="position: sticky; top: var(--space-4); padding: var(--space-2);">
                <button class="prof-nav-btn active" data-section="identity"><i data-lucide="user"></i> Identity</button>
                <button class="prof-nav-btn" data-section="health"><i data-lucide="activity"></i> Health Profile</button>
                <button class="prof-nav-btn" data-section="prefs"><i data-lucide="settings"></i> Preferences</button>
                <button class="prof-nav-btn" data-section="security"><i data-lucide="shield"></i> Security</button>
            </div>

            <!-- Right Content Panels -->
            <div id="prof-panels-container" style="position: relative;">
                
                <!-- Section A: Identity -->
                <div class="card-surface prof-panel active" id="panel-identity">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0;">Identity</h3>
                        <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 13px;">Edit</button>
                    </div>
                    <div style="display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-4);">
                        <div class="accent-pulse" style="width: 80px; height: 80px; border-radius: 50%;">
                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);">
                        </div>
                        <div>
                            <div style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">${user.name || 'Set your name'}</div>
                            <div style="color: var(--text-secondary); font-size: 14px;">${user.email || 'Set your email'}</div>
                        </div>
                    </div>
                </div>

                <!-- Section B: Health Profile -->
                <div class="card-surface prof-panel" id="panel-health" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0;">Health Profile</h3>
                        <button class="btn btn-outline edit-btn" style="padding: 6px 12px; font-size: 13px;">Edit</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                        <div style="padding: var(--space-2); border-radius: var(--radius-md); background: var(--bg-hover);">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Height</div>
                            <div style="font-size: 16px; font-weight: 500;">${user.height ? user.height + ' cm' : 'Not set'}</div>
                        </div>
                        <div style="padding: var(--space-2); border-radius: var(--radius-md); background: var(--bg-hover);">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Weight</div>
                            <div style="font-size: 16px; font-weight: 500;">${user.weight ? user.weight + ' kg' : 'Not set'}</div>
                        </div>
                        <div style="padding: var(--space-2); border-radius: var(--radius-md); background: var(--bg-hover);">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">BMI</div>
                            <div style="font-size: 16px; font-weight: 500;">${user.bmi || 'Not calculated'}</div>
                        </div>
                        <div style="padding: var(--space-2); border-radius: var(--radius-md); background: var(--bg-hover);">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Blood Group</div>
                            <div style="font-size: 16px; font-weight: 500;">${user.blood || 'Not set'}</div>
                        </div>
                    </div>
                </div>

                <!-- Section C: Preferences -->
                <div class="card-surface prof-panel" id="panel-prefs" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0;">Preferences</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px;">Language</div>
                                <div style="font-size: 12px; color: var(--text-tertiary);">English (US)</div>
                            </div>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">Change</button>
                        </div>
                        <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px;">Push Notifications</div>
                                <div style="font-size: 12px; color: var(--text-tertiary);">Enabled for reminders</div>
                            </div>
                            <div style="width: 40px; height: 20px; background: var(--primary); border-radius: 10px; position: relative; cursor: pointer;">
                                <div style="position: absolute; right: 2px; top: 2px; width: 16px; height: 16px; background: white; border-radius: 50%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section D: Security -->
                <div class="card-surface prof-panel" id="panel-security" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-color);">
                        <h3 style="margin: 0;">Security</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px;">Password</div>
                                <div style="font-size: 12px; color: var(--text-tertiary);">Last changed 3 months ago</div>
                            </div>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">Update</button>
                        </div>
                        <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 4px;">Active Sessions</div>
                                <div style="font-size: 12px; color: var(--text-tertiary);">1 Device (This PC)</div>
                            </div>
                            <button class="btn btn-outline danger" style="padding: 6px 12px; font-size: 12px; color: var(--danger); border-color: rgba(239, 68, 68, 0.3);">Sign Out All</button>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
        
        <!-- Editable Slide Panel Modal -->
        <div id="prof-slide-modal" style="position: fixed; top: 0; right: -450px; width: 450px; height: 100vh; background: var(--bg-surface); z-index: var(--z-modal); box-shadow: var(--shadow-lg); transition: right var(--duration-normal) var(--ease-premium); border-left: 1px solid var(--border-color); display: flex; flex-direction: column;">
            <div style="padding: var(--space-4); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover);">
                <h3 style="margin: 0;">Edit Information</h3>
                <button class="icon-btn" id="prof-modal-close"><i data-lucide="x"></i></button>
            </div>
            <div style="padding: var(--space-4); flex: 1; overflow-y: auto;">
                <div style="margin-bottom: var(--space-3);">
                    <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Name</label>
                    <input type="text" class="search-bar" value="${user.name || ''}" style="width: 100%; padding: 12px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                </div>
                <div style="margin-bottom: var(--space-3);">
                    <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Email</label>
                    <input type="email" class="search-bar" value="${user.email || ''}" style="width: 100%; padding: 12px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Height (cm)</label>
                        <input type="number" class="search-bar" value="${user.height || ''}" style="width: 100%; padding: 12px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">Weight (kg)</label>
                        <input type="number" class="search-bar" value="${user.weight || ''}" style="width: 100%; padding: 12px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: var(--radius-md); outline: none;">
                    </div>
                </div>
                <button class="btn btn-primary" id="prof-modal-save" style="width: 100%; justify-content: center;">Save Changes</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const navBtns = container.querySelectorAll('.prof-nav-btn');
        const panels = container.querySelectorAll('.prof-panel');
        const slideModal = container.querySelector('#prof-slide-modal');
        const closeBtn = container.querySelector('#prof-modal-close');
        const saveBtn = container.querySelector('#prof-modal-save');
        const editBtns = container.querySelectorAll('.edit-btn');
        
        // Navigation Logic
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
            btn.style.padding = '12px 16px';
            btn.style.borderRadius = 'var(--radius-md)';
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.cursor = 'pointer';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '12px';
            btn.style.transition = 'all 0.2s';
        });
        const activeBtn = container.querySelector('.prof-nav-btn.active');
        if(activeBtn) {
            activeBtn.style.color = 'var(--primary)';
            activeBtn.style.background = 'rgba(20, 184, 166, 0.1)';
            activeBtn.style.fontWeight = '600';
        }

        // Slide Modal Logic
        const openModal = () => {
            slideModal.style.right = '0';
            const dim = document.getElementById('global-dim');
            if (dim) dim.classList.add('active');
        };

        const closeModal = () => {
            slideModal.style.right = '-450px';
            const dim = document.getElementById('global-dim');
            if (dim) dim.classList.remove('active');
        };

        editBtns.forEach(btn => btn.addEventListener('click', openModal));
        closeBtn.addEventListener('click', closeModal);
        
        const dimEl = document.getElementById('global-dim');
        if (dimEl) {
            dimEl.addEventListener('click', closeModal);
        }

        saveBtn.addEventListener('click', () => {
            saveBtn.innerHTML = '<i data-lucide="loader" class="animate-pulse"></i> Saving...';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                closeModal();
                toast.show('Profile updated successfully.', 'success');
                saveBtn.innerText = 'Save Changes';
            }, 800);
        });

    }, 0);

    return container;
}
