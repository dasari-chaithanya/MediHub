/**
 * Symptoms Engine (symptoms.js)
 */
import { fetchMockData } from '../utils.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    const conditions = await fetchMockData('conditions.json') || [];
    const symMap = await fetchMockData('symptoms-map.json') || {};

    container.innerHTML = `
        <div class="card-surface mb-4">
            <h2>Symptoms Engine</h2>
            <p>Understand what you are feeling with our guided educational assessment.</p>
        </div>

        <div class="bento-grid">
            <!-- Input Section -->
            <div class="card-surface">
                <h3 class="mb-3">What are you feeling?</h3>
                <textarea id="sym-input" class="search-bar" placeholder="e.g. fever, dry cough, mild headache" style="width: 100%; border: 1px solid var(--border-color); background: var(--bg-app); border-radius: var(--radius-md); padding: 16px; min-height: 120px; resize: none; margin-bottom: var(--space-3); line-height: 1.5; font-size: 15px; outline: none;"></textarea>
                
                <button class="btn btn-primary" id="sym-analyze" style="width: 100%; padding: 14px; font-size: 16px; box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);">Analyze Symptoms</button>

                <div class="card-info mt-4" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); margin-top: var(--space-4);">
                    <i data-lucide="alert-circle" style="color: var(--warning);"></i>
                    <p style="margin:0; font-size: 12px; color: var(--text-secondary);"><strong>Disclaimer:</strong> This tool provides educational guidance based on your input. It is not a substitute for a professional medical diagnosis. If you are experiencing a medical emergency, visit the Emergency section immediately.</p>
                </div>
            </div>

            <!-- Results Section -->
            <div id="sym-results-container">
                <div class="card-surface empty-state" style="height: 100%; justify-content: center;">
                    <i data-lucide="stethoscope" class="empty-icon" style="color: var(--border-color); width: 64px; height: 64px;"></i>
                    <h3 style="margin-bottom: 8px;">Waiting for input</h3>
                    <p>Describe your symptoms to see related conditions and guidance.</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const input = container.querySelector('#sym-input');
        const analyzeBtn = container.querySelector('#sym-analyze');
        const resultsContainer = container.querySelector('#sym-results-container');

        analyzeBtn.addEventListener('click', () => {
            const val = input.value.trim().toLowerCase();
            if (!val) return;

            // Simple mock extraction logic
            let matchedConditionIds = new Set();
            let foundKeywords = [];
            
            Object.keys(symMap).forEach(key => {
                if (val.includes(key)) {
                    foundKeywords.push(key);
                    symMap[key].forEach(id => matchedConditionIds.add(id));
                }
            });

            const matchedConditions = conditions.filter(c => matchedConditionIds.has(c.id));

            if (matchedConditions.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="card-surface animate-fade-in" style="height: 100%;">
                        <h3 class="mb-3">Results</h3>
                        <div class="card-info" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2);">
                            <i data-lucide="info" style="color: var(--danger);"></i>
                            <p style="margin:0; font-size: 14px; color: var(--text-primary);">We couldn't confidently map your description to our database. Please try using simple keywords like "fever", "headache", or consult a medical professional.</p>
                        </div>
                    </div>
                `;
            } else {
                resultsContainer.innerHTML = `
                    <div class="animate-slide-up">
                        <!-- Section A: Possible Conditions -->
                        <div class="card-surface mb-3">
                            <h3 style="margin-bottom: var(--space-3); color: var(--primary);">A. Possible Conditions</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                                ${matchedConditions.map(c => `
                                    <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-2); background: var(--bg-hover);">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                            <h4 style="margin: 0; font-size: 16px;">${c.name}</h4>
                                            <span class="badge" style="background: rgba(20, 184, 166, 0.1); color: var(--primary); padding: 4px 8px; border-radius: var(--radius-full); font-size: 11px;">${c.category}</span>
                                        </div>
                                        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">${c.description}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Section B & C Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                            
                            <!-- Section B: Educational Guidance -->
                            <div class="card-surface">
                                <h4 style="margin-bottom: var(--space-2); color: var(--text-primary);">B. General Guidance</h4>
                                <ul style="padding-left: 20px; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                    ${matchedConditions.slice(0,2).map(c => `<li>${c.guidance}</li>`).join('')}
                                    <li>Stay hydrated and monitor your symptoms closely.</li>
                                </ul>
                            </div>

                            <!-- Section C: Related Medicines -->
                            <div class="card-surface">
                                <h4 style="margin-bottom: var(--space-2); color: var(--text-primary);">C. Related MediDex</h4>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <a href="#/medidex" class="btn btn-outline" style="justify-content: flex-start; padding: 8px 12px; font-size: 13px;"><i data-lucide="pill" style="width: 16px;"></i> Search Paracetamol</a>
                                    <a href="#/medidex" class="btn btn-outline" style="justify-content: flex-start; padding: 8px 12px; font-size: 13px;"><i data-lucide="pill" style="width: 16px;"></i> Search Antihistamines</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            if (window.lucide) window.lucide.createIcons();
        });
    }, 0);

    return container;
}
