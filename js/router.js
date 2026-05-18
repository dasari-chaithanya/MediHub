/**
 * Router (router.js)
 */
import { $, $$ } from './utils.js';
import { appState } from './state.js';

const routes = {
    'auth': { title: 'Welcome', subtitle: 'Sign in to your account' },
    'onboarding': { title: 'Setup', subtitle: 'Personalize your experience' },
    'dashboard': { title: 'Dashboard', subtitle: 'Your personal health overview' },
    'reminders': { title: 'Reminders', subtitle: 'Manage your medication schedule' },
    'medidex': { title: 'MediDex', subtitle: 'Search medications and alternatives' },
    'symptoms': { title: 'Symptoms Engine', subtitle: 'Understand what you are feeling' },
    'wound-analyzer': { title: 'Wound Analyzer', subtitle: 'AI-assisted wound assessment' },
    'emergency': { title: 'Emergency', subtitle: 'Immediate health assistance' },
    'profile': { title: 'Profile', subtitle: 'Manage your health information' },
    'health-library': { title: 'Health Library', subtitle: 'Learn about conditions' },
    'settings': { title: 'Settings', subtitle: 'App preferences' }
};

export class Router {
    constructor() {
        this.viewContainer = $('#router-view');
        this.pageTitle = $('#page-title');
        this.pageSubtitle = $('#page-subtitle');
        
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    async init() {
        // Ensure state is loaded before routing
        const state = await appState.init();
        
        if (state.needsOnboarding) {
            window.location.hash = '#/onboarding';
        } else if (!window.location.hash) {
            window.location.hash = '#/auth';
        } else {
            this.handleRoute();
        }
    }

    async handleRoute() {
        const hash = window.location.hash.replace('#/', '') || 'dashboard';
        const routeName = hash.split('?')[0]; // simple ignore query params for now
        
        if (routes[routeName]) {
            this.updateHeader(routes[routeName]);
            this.updateActiveNav(routeName);
            appState.setState({ currentRoute: routeName });
            
            // Clean up view
            this.viewContainer.innerHTML = '';
            this.viewContainer.style.opacity = 0;
            
            // Handle layout visibility for Auth & Onboarding
            const sidebar = $('#sidebar');
            const topbar = document.querySelector('.topbar');
            if (routeName === 'auth' || routeName === 'onboarding') {
                if (sidebar) sidebar.style.display = 'none';
                if (topbar) topbar.style.display = 'none';
                this.viewContainer.style.padding = '0';
            } else {
                if (sidebar) sidebar.style.display = 'flex';
                if (topbar) topbar.style.display = 'flex';
                this.viewContainer.style.padding = 'var(--space-4)';
            }

            try {
                // Dynamically import the module handler
                // Fallback to dashboard if module doesn't exist yet
                let module;
                try {
                    module = await import(`./modules/${routeName}.js`);
                } catch (e) {
                    // console.warn(`Module ${routeName} not found, rendering placeholder.`);
                    this.renderPlaceholder(routeName);
                    this.fadeIn();
                    return;
                }
                
                if (module.render) {
                    this.viewContainer.appendChild(await module.render());
                    if (window.lucide) window.lucide.createIcons();
                }
            } catch (err) {
                console.error('Error routing to', routeName, err);
                this.renderPlaceholder(routeName);
            }
            
            this.fadeIn();
        } else {
            window.location.hash = '#/dashboard';
        }
    }

    updateHeader({ title, subtitle }) {
        if (this.pageTitle) this.pageTitle.textContent = title;
        if (this.pageSubtitle) this.pageSubtitle.textContent = subtitle;
    }

    updateActiveNav(routeName) {
        $$('.nav-item').forEach(item => {
            if (item.dataset.route === routeName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    fadeIn() {
        requestAnimationFrame(() => {
            this.viewContainer.style.transition = 'opacity 0.3s ease-in-out';
            this.viewContainer.style.opacity = 1;
        });
    }

    renderPlaceholder(routeName) {
        this.viewContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="layout-template" class="empty-icon"></i>
                <h2>${routes[routeName]?.title || 'Coming Soon'}</h2>
                <p>This module is currently under development.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}
