/**
 * Auth Module (auth.js)
 * Connected to real backend via appState.login() / appState.register()
 */

import { appState } from '../state.js';
import { toast } from '../toast.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in';
    container.style.display = 'flex';
    container.style.height = '100vh';
    container.style.width = '100%';
    container.style.overflow = 'hidden';

    container.innerHTML = `
        <!-- Left Side: Visual Branding Panel -->
        <div style="flex: 1; background: linear-gradient(135deg, var(--bg-app), var(--bg-surface)); display: flex; flex-direction: column; justify-content: center; padding: var(--space-6); position: relative; overflow: hidden; border-right: 1px solid var(--border-color);">
            <div style="position: absolute; top: -100px; left: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0) 70%); border-radius: 50%; pointer-events: none;"></div>
            
            <div style="position: relative; z-index: 1; max-width: 480px; margin: 0 auto;">
                <div class="brand mb-4" style="font-size: 32px; font-family: 'Sora', sans-serif; display: flex; align-items: center; gap: var(--space-2);">
                    <i data-lucide="activity" style="color: var(--primary); width: 40px; height: 40px;"></i>
                    <span style="color: var(--text-primary); font-weight: 700;">MediHub</span>
                </div>
                
                <h1 style="font-size: 42px; line-height: 1.2; margin-bottom: var(--space-3);">Your intelligent companion for health continuity and wellness awareness.</h1>
                <p style="color: var(--text-secondary); font-size: 18px; margin-bottom: var(--space-6);">Experience a calm, structured approach to managing your personal health data.</p>
                
                <!-- Floating preview cards -->
                <div class="card-metric animate-pulse" style="width: max-content; margin-bottom: var(--space-3); transform: rotate(-2deg);">
                    <div style="color: var(--success);"><i data-lucide="check-circle"></i></div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">Reminders completed</div>
                        <div style="font-size: 12px; color: var(--text-tertiary);">All caught up today</div>
                    </div>
                </div>
                
                <div class="card-metric animate-slide-up stagger-2" style="width: max-content; margin-left: 40px; transform: rotate(1deg);">
                    <div style="color: var(--primary);"><i data-lucide="scan"></i></div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">Wound Analyzer</div>
                        <div style="font-size: 12px; color: var(--text-tertiary);">AI Assessment Ready</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Side: Auth Card -->
        <div style="flex: 1; background: var(--bg-surface); display: flex; align-items: center; justify-content: center; padding: var(--space-6);">
            <div style="width: 100%; max-width: 400px;">
                <!-- Tabs -->
                <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-4); border-bottom: 2px solid var(--border-color);">
                    <button class="auth-tab active" data-tab="signin" style="padding-bottom: 8px; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 18px; border-bottom: 2px solid var(--primary); color: var(--text-primary); margin-bottom: -2px; transition: all var(--duration-fast);">Sign In</button>
                    <button class="auth-tab" data-tab="signup" style="padding-bottom: 8px; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 18px; border-bottom: 2px solid transparent; color: var(--text-tertiary); margin-bottom: -2px; transition: all var(--duration-fast);">Create Account</button>
                </div>

                <!-- Error Banner -->
                <div id="auth-error" style="display: none; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: var(--space-3); font-size: 13px; color: var(--danger);"></div>

                <!-- Sign In Form -->
                <div id="form-signin" class="auth-form animate-fade-in">
                    <div class="mb-3">
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500;">Email Address</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-app); border-radius: var(--radius-md);">
                            <input id="signin-email" type="email" placeholder="you@example.com" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    <div class="mb-2">
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500;">Password</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-app); border-radius: var(--radius-md);">
                            <input id="signin-password" type="password" placeholder="••••••••" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    <div style="text-align: right; margin-bottom: var(--space-4);">
                        <a href="#" style="font-size: 13px; font-weight: 500;">Forgot password?</a>
                    </div>
                    
                    <button id="btn-login" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 16px; justify-content: center; box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);">Sign In</button>
                </div>

                <!-- Create Account Form -->
                <div id="form-signup" class="auth-form" style="display: none;">
                    <div class="mb-3">
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500;">Full Name</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-app); border-radius: var(--radius-md);">
                            <input id="signup-name" type="text" placeholder="Siddhartha" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500;">Email Address</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-app); border-radius: var(--radius-md);">
                            <input id="signup-email" type="email" placeholder="you@example.com" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    <div class="mb-4">
                        <label style="display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500;">Password</label>
                        <div class="search-bar" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-app); border-radius: var(--radius-md);">
                            <input id="signup-password" type="password" placeholder="At least 6 characters" style="width: 100%; padding: 12px; background: transparent;">
                        </div>
                    </div>
                    
                    <button id="btn-signup" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 16px; justify-content: center; box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);">Create Account</button>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const tabs = container.querySelectorAll('.auth-tab');
        const formSignin = container.querySelector('#form-signin');
        const formSignup = container.querySelector('#form-signup');
        const errorBanner = container.querySelector('#auth-error');

        const showError = (msg) => {
            errorBanner.textContent = msg;
            errorBanner.style.display = 'block';
        };
        const hideError = () => { errorBanner.style.display = 'none'; };

        const setLoading = (btn, loading) => {
            btn.disabled = loading;
            btn.innerHTML = loading
                ? '<i data-lucide="loader-2" class="animate-spin" style="width:16px;height:16px;"></i> Please wait...'
                : btn.dataset.originalText;
            if (window.lucide) window.lucide.createIcons();
        };

        // Save original button text
        container.querySelector('#btn-login').dataset.originalText = 'Sign In';
        container.querySelector('#btn-signup').dataset.originalText = 'Create Account';

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                hideError();
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.borderBottomColor = 'transparent';
                    t.style.color = 'var(--text-tertiary)';
                });
                tab.classList.add('active');
                tab.style.borderBottomColor = 'var(--primary)';
                tab.style.color = 'var(--text-primary)';

                if (tab.dataset.tab === 'signin') {
                    formSignin.style.display = 'block';
                    formSignin.classList.add('animate-fade-in');
                    formSignup.style.display = 'none';
                } else {
                    formSignup.style.display = 'block';
                    formSignup.classList.add('animate-fade-in');
                    formSignin.style.display = 'none';
                }
            });
        });

        // Login
        const btnLogin = container.querySelector('#btn-login');
        btnLogin.addEventListener('click', async () => {
            hideError();
            const email = container.querySelector('#signin-email').value.trim();
            const password = container.querySelector('#signin-password').value;

            if (!email || !password) {
                showError('Please fill in all fields.');
                return;
            }

            setLoading(btnLogin, true);
            try {
                await appState.login(email, password);
            } catch (err) {
                showError(err.message || 'Sign in failed. Please try again.');
                setLoading(btnLogin, false);
            }
        });

        // Signup
        const btnSignup = container.querySelector('#btn-signup');
        btnSignup.addEventListener('click', async () => {
            hideError();
            const name = container.querySelector('#signup-name').value.trim();
            const email = container.querySelector('#signup-email').value.trim();
            const password = container.querySelector('#signup-password').value;

            if (!name || !email || !password) {
                showError('Please fill in all fields.');
                return;
            }
            if (password.length < 6) {
                showError('Password must be at least 6 characters.');
                return;
            }

            setLoading(btnSignup, true);
            try {
                await appState.register(name, email, password);
            } catch (err) {
                showError(err.message || 'Registration failed. Please try again.');
                setLoading(btnSignup, false);
            }
        });

        // Allow Enter key to submit
        container.querySelector('#signin-password').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnLogin.click();
        });
        container.querySelector('#signup-password').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnSignup.click();
        });

    }, 0);

    return container;
}
