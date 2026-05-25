/**
 * Health Library Module (health-library.js)
 * Main orchestrator for the premium health library experience.
 */
import { fetchMockData } from '../utils.js';
import { createDrawer } from '../components/hl-drawer.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'hl-container animate-fade-in stagger-1';

    // 1. Initial UI with Skeleton Loader
    container.innerHTML = `
        <div class="hl-header-section mb-4">
            <div>
                <h2>Health Library</h2>
                <p>Explore our editorial collection of health conditions, prevention, and guidance.</p>
            </div>
            
            <div class="search-bar hl-search" style="margin-top: 16px;">
                <i data-lucide="search" class="search-icon"></i>
                <input type="text" id="hl-search-input" placeholder="Search conditions or symptoms..." aria-label="Search health library">
            </div>
        </div>

        <div id="hl-grid" class="hl-grid">
            <!-- Skeleton Loaders -->
            ${Array(6).fill().map((_, i) => `
                <div class="hl-card skeleton-card animate-pulse" style="animation-delay: ${i * 100}ms">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                    <div class="skeleton-chips">
                        <div class="skeleton-chip"></div>
                        <div class="skeleton-chip"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Wait a brief moment to show the skeleton (UX polish)
    setTimeout(async () => {
        const gridEl = container.querySelector('#hl-grid');
        const searchInput = container.querySelector('#hl-search-input');
        
        // Ensure drawer component is created once per render
        let drawer;
        try {
            drawer = createDrawer(container);
        } catch (err) {
            console.error("Failed to create drawer", err);
        }

        let conditions = [];
        try {
            conditions = await fetchMockData('conditions.json') || [];
        } catch (err) {
            console.error("Failed to load conditions:", err);
            gridEl.innerHTML = `
                <div class="hl-empty-state hl-error-state">
                    <i data-lucide="alert-circle" class="empty-icon text-danger"></i>
                    <h3>Unable to load health data</h3>
                    <p>There was a problem connecting to the medical database.</p>
                    <button class="btn btn-outline mt-3" onclick="window.location.reload()">Retry</button>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const renderGrid = (query = '') => {
            const q = query.toLowerCase().trim();
            
            const filtered = conditions.filter(c => {
                if (!q) return true;
                
                const matchName = c.name.toLowerCase().includes(q);
                const matchDesc = c.description.toLowerCase().includes(q);
                const matchCategory = c.category.toLowerCase().includes(q);
                
                // Fallback to original symptoms array for filtering if commonSymptoms isn't defined yet
                const symptomsList = c.commonSymptoms ? c.commonSymptoms.map(s => s.name) : (c.symptoms || []);
                const matchSymptom = symptomsList.some(s => s.toLowerCase().includes(q));
                
                return matchName || matchDesc || matchCategory || matchSymptom;
            });

            if (filtered.length === 0) {
                gridEl.innerHTML = `
                    <div class="hl-empty-state">
                        <i data-lucide="search-x" class="empty-icon"></i>
                        <h3>No conditions found</h3>
                        <p>We couldn't find anything matching "${query}". Try a different term or symptom.</p>
                        <button class="btn btn-outline mt-3" id="hl-reset-search">Clear Search</button>
                    </div>
                `;
                
                const resetBtn = gridEl.querySelector('#hl-reset-search');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        searchInput.value = '';
                        renderGrid();
                    });
                }
            } else {
                gridEl.innerHTML = filtered.map((c, idx) => {
                    // Get up to 3 symptoms for the card chips
                    const symptomsList = c.commonSymptoms ? c.commonSymptoms.map(s => s.name) : (c.symptoms || []);
                    const displaySymptoms = symptomsList.slice(0, 3);
                    const remainingCount = symptomsList.length - 3;
                    
                    return `
                        <div class="hl-card animate-slide-up stagger-${(idx % 5) + 1}" data-id="${c.id}" tabindex="0" role="button" aria-label="View details for ${c.name}">
                            <div class="hl-card-header">
                                <h3 class="hl-card-title">${c.name}</h3>
                                <span class="hl-badge hl-badge-category">${c.category}</span>
                            </div>
                            
                            <p class="hl-card-desc">${c.description}</p>
                            
                            <div class="hl-card-chips">
                                ${displaySymptoms.map(s => `
                                    <button class="hl-chip" data-symptom="${s}" aria-label="View details for symptom: ${s}">
                                        ${s}
                                    </button>
                                `).join('')}
                                ${remainingCount > 0 ? `<span class="hl-chip-more">+${remainingCount} more</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                // Attach event listeners to new cards
                gridEl.querySelectorAll('.hl-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const conditionId = card.dataset.id;
                        const condition = conditions.find(c => c.id === conditionId);
                        
                        // Check if a specific symptom chip was clicked
                        if (e.target.classList.contains('hl-chip')) {
                            e.stopPropagation(); // Don't trigger the card click again
                            const symptom = e.target.dataset.symptom;
                            if (drawer && condition) {
                                drawer.open(condition, symptom);
                            }
                        } else {
                            if (drawer && condition) {
                                drawer.open(condition);
                            }
                        }
                    });
                    
                    // Keyboard support for cards (Enter/Space)
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            card.click();
                        }
                    });
                });
            }
            
            if (window.lucide) window.lucide.createIcons();
        };

        // Initialize grid
        renderGrid();

        // Attach search listener
        searchInput.addEventListener('input', (e) => renderGrid(e.target.value));

    }, 400); // Small artificial delay for skeleton loader effect

    return container;
}
