/**
 * Command Palette Component (command-palette.js)
 */
import { fetchMockData } from '../utils.js';

export async function initCommandPalette() {
    const medicines = await fetchMockData('medicines.json') || [];
    const conditions = await fetchMockData('conditions.json') || [];
    
    // Inject DOM
    const palette = document.createElement('div');
    palette.id = 'cmd-palette-wrapper';
    palette.style.position = 'fixed';
    palette.style.inset = '0';
    palette.style.background = 'rgba(0,0,0,0.5)';
    palette.style.backdropFilter = 'blur(4px)';
    palette.style.zIndex = '9999';
    palette.style.display = 'none';
    palette.style.alignItems = 'flex-start';
    palette.style.justifyContent = 'center';
    palette.style.paddingTop = '10vh';
    palette.style.opacity = '0';
    palette.style.transition = 'opacity 0.2s ease';

    palette.innerHTML = `
        <div id="cmd-palette" style="background: var(--bg-surface); width: 100%; max-width: 600px; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1); border: 1px solid var(--border-color);">
            <div style="padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px;">
                <i data-lucide="search" style="color: var(--text-tertiary); width: 20px;"></i>
                <input type="text" id="cmd-input" placeholder="Search medicines, conditions, or navigate..." style="width: 100%; background: transparent; border: none; outline: none; font-size: 16px; color: var(--text-primary); font-family: inherit;">
                <kbd style="background: var(--bg-hover); border: 1px solid var(--border-color); padding: 2px 6px; border-radius: 4px; font-size: 11px; color: var(--text-tertiary);">ESC</kbd>
            </div>
            <div id="cmd-results" style="max-height: 400px; overflow-y: auto; padding: 8px 0;">
                <div class="cmd-group-title" style="padding: 8px 16px; font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Navigation</div>
                <div class="cmd-item" data-href="#/dashboard" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <i data-lucide="layout-dashboard" style="width: 16px; color: var(--primary);"></i>
                    <span>Dashboard</span>
                </div>
                <div class="cmd-item" data-href="#/reminders" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <i data-lucide="bell" style="width: 16px; color: var(--warning);"></i>
                    <span>Reminders</span>
                </div>
                <div class="cmd-item" data-href="#/wound-analyzer" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <i data-lucide="scan" style="width: 16px; color: var(--primary);"></i>
                    <span>Wound Analyzer</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(palette);
    if (window.lucide) window.lucide.createIcons();

    const wrapper = document.getElementById('cmd-palette-wrapper');
    const modal = document.getElementById('cmd-palette');
    const input = document.getElementById('cmd-input');
    const resultsContainer = document.getElementById('cmd-results');

    const openPalette = () => {
        wrapper.style.display = 'flex';
        setTimeout(() => {
            wrapper.style.opacity = '1';
            modal.style.transform = 'scale(1)';
            input.focus();
        }, 10);
    };

    const closePalette = () => {
        wrapper.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            wrapper.style.display = 'none';
            input.value = '';
            renderResults(''); // reset
        }, 200);
    };

    // Keyboard navigation variables
    let selectedIndex = -1;

    // Keyboard trigger (CTRL+K or CMD+K) and Navigation
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (wrapper.style.display === 'flex') closePalette();
            else openPalette();
            return;
        }
        
        if (wrapper.style.display !== 'flex') return;

        const items = Array.from(resultsContainer.querySelectorAll('.cmd-item'));
        
        if (e.key === 'Escape') {
            closePalette();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].click();
            } else if (items.length > 0) {
                items[0].click(); // default to first if none selected
            }
        }
    });

    const updateSelection = (items) => {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.style.background = 'var(--bg-hover)';
                item.style.borderLeftColor = 'var(--primary)';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = 'transparent';
                item.style.borderLeftColor = 'transparent';
            }
        });
    };

    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) closePalette();
    });

    // Navigation trigger from header
    document.addEventListener('click', (e) => {
        if (e.target.closest('#header-search-trigger')) {
            openPalette();
        }
    });

    // Filtering logic
    const renderResults = (query) => {
        const q = query.toLowerCase().trim();
        if (!q) {
            resultsContainer.innerHTML = `
                <div class="cmd-group-title" style="padding: 8px 16px; font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Navigation</div>
                <div class="cmd-item" data-href="#/dashboard" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-left: 2px solid transparent;">
                    <i data-lucide="layout-dashboard" style="width: 16px; color: var(--primary);"></i><span>Dashboard</span>
                </div>
                <div class="cmd-item" data-href="#/reminders" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-left: 2px solid transparent;">
                    <i data-lucide="bell" style="width: 16px; color: var(--warning);"></i><span>Reminders</span>
                </div>
                <div class="cmd-item" data-href="#/wound-analyzer" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-left: 2px solid transparent;">
                    <i data-lucide="scan" style="width: 16px; color: var(--primary);"></i><span>Wound Analyzer</span>
                </div>
            `;
            attachClickEvents();
            if(window.lucide) window.lucide.createIcons();
            return;
        }

        const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)).slice(0, 3);
        const filteredConds = conditions.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);

        // SKELETON LOADER STATE
        resultsContainer.innerHTML = `
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; animation: pulse-subtle 1.5s infinite;">
                <div style="height: 32px; background: var(--bg-hover); border-radius: 8px;"></div>
                <div style="height: 32px; background: var(--bg-hover); border-radius: 8px;"></div>
                <div style="height: 32px; background: var(--bg-hover); border-radius: 8px;"></div>
            </div>
        `;

        setTimeout(() => {
            let html = '';

            if (filteredMeds.length > 0) {
                html += `<div class="cmd-group-title" style="padding: 8px 16px; font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Medicines</div>`;
                html += filteredMeds.map(m => `
                    <div class="cmd-item" data-href="#/medidex" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-left: 2px solid transparent;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i data-lucide="pill" style="width: 16px; color: var(--text-secondary);"></i>
                            <span style="font-weight: 500;">${m.name}</span>
                        </div>
                        <span style="font-size: 11px; color: var(--text-tertiary); background: var(--bg-hover); padding: 2px 6px; border-radius: 4px;">${m.category}</span>
                    </div>
                `).join('');
            }

            if (filteredConds.length > 0) {
                html += `<div class="cmd-group-title" style="padding: 8px 16px; font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Conditions</div>`;
                html += filteredConds.map(c => `
                    <div class="cmd-item" data-href="#/symptoms" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-left: 2px solid transparent;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i data-lucide="activity" style="width: 16px; color: var(--text-secondary);"></i>
                            <span style="font-weight: 500;">${c.name}</span>
                        </div>
                    </div>
                `).join('');
            }

            if (filteredMeds.length === 0 && filteredConds.length === 0) {
                html = `<div style="padding: 32px 16px; text-align: center; color: var(--text-tertiary); font-size: 14px;">No results found for "${q}"</div>`;
            }

            selectedIndex = -1;
            resultsContainer.innerHTML = html;
            attachClickEvents();
            if(window.lucide) window.lucide.createIcons();
        }, 300); // 300ms simulation
    };

    const attachClickEvents = () => {
        const items = resultsContainer.querySelectorAll('.cmd-item');
        items.forEach(item => {
            // Hover effect
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--bg-hover)';
                item.style.borderLeftColor = 'var(--primary)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                item.style.borderLeftColor = 'transparent';
            });
            // Click
            item.addEventListener('click', () => {
                window.location.hash = item.dataset.href;
                closePalette();
            });
        });
    };

    input.addEventListener('input', (e) => renderResults(e.target.value));
    
    // Initial attach
    attachClickEvents();
}
