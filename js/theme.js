/**
 * Theme Manager (theme.js)
 */
import { appState } from './state.js';

export function initTheme() {
    const applyTheme = (mode) => {
        if (mode === 'focus') {
            document.body.classList.add('focus-mode');
            document.body.classList.remove('calm-mode');
        } else {
            document.body.classList.add('calm-mode');
            document.body.classList.remove('focus-mode');
        }
        updateSwitcherUI(mode);
    };

    const updateSwitcherUI = (mode) => {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    };

    // Initial load
    applyTheme(appState.getState().theme);

    // Listeners
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newMode = btn.dataset.mode;
            appState.setTheme(newMode);
        });
    });

    // Subscribe to state changes
    appState.subscribe((state) => {
        applyTheme(state.theme);
    });
}
