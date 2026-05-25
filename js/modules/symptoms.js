/**
 * Symptoms Engine (symptoms.js)
 * Refined SaaS input and integrated drawer.
 */
import { fetchMockData } from '../utils.js';
import { createDrawer } from '../components/hl-drawer.js';
import { createEmptyStateHTML } from '../components/ui.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    const conditions = await fetchMockData('conditions.json') || [];
    const symMap = await fetchMockData('symptoms-map.json') || {};

    // Initialize the shared drawer
    const drawer = createDrawer(container);

    container.innerHTML = `
        <div style="margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-4);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%;"></div>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase;">Educational Assessment Tool</span>
            </div>
            <h1 style="font-size: 28px; margin-bottom: 8px; color: var(--text-primary);">Symptoms Engine</h1>
            <p style="color: var(--text-secondary); font-size: 15px; max-width: 600px; margin: 0; line-height: 1.5;">Describe what you are feeling to see related conditions and guidance. <strong>Not a substitute for professional medical diagnosis.</strong></p>
        </div>

        <div class="bento-grid" style="grid-template-columns: 1fr 1.5fr; gap: var(--space-4);">
            <!-- Input Section -->
            <div class="card-surface" style="border: 1px solid var(--border-color);">
                <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">What are you experiencing?</label>
                <div style="position: relative;">
                    <textarea id="sym-input" class="search-bar" placeholder="e.g. fever, dry cough, mild headache" style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; min-height: 140px; resize: none; line-height: 1.6; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;"></textarea>
                </div>
                
                <button class="btn btn-primary" id="sym-analyze" style="width: 100%; padding: 12px; font-size: 14px; margin-top: 16px; justify-content: center;">Analyze Symptoms</button>

                <div class="mt-4" style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-sm); display: flex; gap: 12px; align-items: flex-start;">
                    <i data-lucide="info" style="color: var(--text-tertiary); width: 16px; flex-shrink: 0; margin-top: 2px;"></i>
                    <p style="margin:0; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">This tool provides general guidance based on keywords. If you are experiencing a medical emergency, please visit the Emergency section immediately.</p>
                </div>
            </div>

            <!-- Results Section -->
            <div id="sym-results-container" style="display: flex; flex-direction: column;">
                <div id="sym-empty" style="flex: 1; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
                    ${createEmptyStateHTML('stethoscope', 'Waiting for input', 'Describe your symptoms to see related conditions and guidance.')}
                </div>
                
                <div id="sym-loading" style="display: none; flex: 1; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                        <i data-lucide="loader" class="animate-pulse" style="color: var(--primary);"></i>
                        <span style="font-weight: 500; color: var(--text-primary);">Analyzing input...</span>
                    </div>
                    <div class="skeleton-text" style="width: 40%; height: 24px; margin-bottom: 16px;"></div>
                    <div class="skeleton-box" style="width: 100%; height: 80px; margin-bottom: 12px;"></div>
                    <div class="skeleton-box" style="width: 100%; height: 80px; margin-bottom: 12px;"></div>
                    <div class="skeleton-box" style="width: 100%; height: 80px;"></div>
                </div>

                <div id="sym-content" style="display: none;"></div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const input = container.querySelector('#sym-input');
        const analyzeBtn = container.querySelector('#sym-analyze');
        const emptyState = container.querySelector('#sym-empty');
        const loadingState = container.querySelector('#sym-loading');
        const contentState = container.querySelector('#sym-content');

        // Focus ring on textarea
        input.addEventListener('focus', () => {
            input.style.borderColor = 'var(--primary)';
            input.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'var(--border-color)';
            input.style.boxShadow = 'none';
        });

        analyzeBtn.addEventListener('click', () => {
            const val = input.value.trim().toLowerCase();
            if (!val) return;

            // Show loading
            emptyState.style.display = 'none';
            contentState.style.display = 'none';
            loadingState.style.display = 'block';

            // Simulate network/analysis delay
            setTimeout(() => {
                let matchedConditionIds = new Set();
                let foundKeywords = [];
                
                Object.keys(symMap).forEach(key => {
                    if (val.includes(key)) {
                        foundKeywords.push(key);
                        symMap[key].forEach(id => matchedConditionIds.add(id));
                    }
                });

                const matchedConditions = conditions.filter(c => matchedConditionIds.has(c.id));

                loadingState.style.display = 'none';
                contentState.style.display = 'block';

                if (matchedConditions.length === 0) {
                    contentState.innerHTML = `
                        <div class="card-surface animate-fade-in" style="height: 100%; border: 1px solid var(--border-color);">
                            <h3 style="margin: 0 0 16px 0; font-size: 16px;">Analysis Results</h3>
                            <div style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-md); display: flex; gap: 12px;">
                                <i data-lucide="help-circle" style="color: var(--text-tertiary); width: 20px; flex-shrink: 0;"></i>
                                <p style="margin:0; font-size: 14px; color: var(--text-primary); line-height: 1.5;">We couldn't confidently map your description to our database. Please try using simpler keywords like "fever", "headache", or consult a medical professional.</p>
                            </div>
                        </div>
                    `;
                } else {
                    contentState.innerHTML = `
                        <div class="animate-slide-up">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <h3 style="margin: 0; font-size: 16px;">Possible Conditions</h3>
                                <span style="font-size: 12px; color: var(--text-secondary);">Found ${matchedConditions.length} match${matchedConditions.length > 1 ? 'es' : ''}</span>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${matchedConditions.map(c => `
                                    <div class="sym-result-card" data-id="${c.id}" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; background: var(--bg-surface); cursor: pointer; transition: all 0.2s;">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                            <h4 style="margin: 0; font-size: 16px; color: var(--text-primary);">${c.name}</h4>
                                            <span style="background: var(--bg-hover); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase;">${c.category}</span>
                                        </div>
                                        <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.5;">${c.description}</p>
                                        <div style="display: flex; align-items: center; gap: 4px; color: var(--primary); font-size: 13px; font-weight: 500;">
                                            View clinical details <i data-lucide="arrow-right" style="width: 14px;"></i>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;

                    // Wire up drawer to the result cards
                    const cards = contentState.querySelectorAll('.sym-result-card');
                    cards.forEach(card => {
                        // Hover styling
                        card.addEventListener('mouseenter', () => {
                            card.style.borderColor = 'var(--primary)';
                            card.style.transform = 'translateY(-2px)';
                            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        });
                        card.addEventListener('mouseleave', () => {
                            card.style.borderColor = 'var(--border-color)';
                            card.style.transform = 'translateY(0)';
                            card.style.boxShadow = 'none';
                        });

                        card.addEventListener('click', () => {
                            const conditionId = card.dataset.id;
                            const condition = conditions.find(c => c.id === conditionId);
                            if (condition) {
                                // Open drawer, highlight the first found symptom if any
                                drawer.open(condition, foundKeywords[0] || '');
                            }
                        });
                    });
                }
                if (window.lucide) window.lucide.createIcons();
            }, 1200); // 1.2s loading simulation
        });
    }, 0);

    return container;
}
