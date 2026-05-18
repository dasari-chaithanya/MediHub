/**
 * Main Entry Point (app.js)
 */
import { initTheme } from './theme.js';
import { initComponents } from './components.js';
import { initCommandPalette } from './components/command-palette.js';
import { attachRippleEffect } from './utils.js';
import { Router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. App Shell Removal
    const appShell = document.getElementById('app-shell');
    if (appShell) {
        setTimeout(() => {
            appShell.classList.add('fade-out');
            setTimeout(() => appShell.remove(), 400);
        }, 800);
    }

    // 2. Initialize Core Systems
    initTheme();
    initComponents();
    initCommandPalette();
    attachRippleEffect();

    // 3. Initialize Router
    const router = new Router();
    router.init();

    setTimeout(() => {
        const loader = document.getElementById('app-shell-loader');
        const appContainer = document.getElementById('app-container');
        
        if (loader && appContainer) {
            appContainer.style.display = 'flex'; // Show main app
            loader.classList.remove('active');   // Fade out loader
            
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500); // Wait for fade out transition (var(--duration-slow))
        }
    }, 1200); // Premium branded load delay
});
