/**
 * Health Library Module (health-library.js)
 */
import { fetchMockData } from '../utils.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    const conditions = await fetchMockData('conditions.json') || [];

    container.innerHTML = `
        <div class="card-surface mb-4">
            <h2>Health Library</h2>
            <p>Explore our editorial collection of health conditions, prevention, and guidance.</p>
        </div>

        <div class="dashboard-grid">
            ${conditions.map((c, idx) => `
                <div class="card-surface animate-slide-up stagger-${(idx % 5) + 1}" style="animation-fill-mode: both;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                        <h3>${c.name}</h3>
                        <span style="font-size: 12px; font-weight: 600; color: var(--primary); background: rgba(20, 184, 166, 0.1); padding: 4px 8px; border-radius: var(--radius-full);">${c.category}</span>
                    </div>
                    <p style="font-size: 14px; margin-bottom: var(--space-3); line-height: 1.6;">${c.description}</p>
                    
                    <div style="background: var(--bg-hover); padding: var(--space-2); border-radius: var(--radius-md); margin-bottom: var(--space-2);">
                        <h4 style="font-size: 13px; margin-bottom: 8px;">Common Symptoms</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${c.symptoms.map(s => `<span style="font-size: 12px; border: 1px solid var(--border-color); padding: 2px 8px; border-radius: var(--radius-full); background: var(--bg-surface);">${s}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="card-info" style="border-left: 3px solid var(--primary); border-radius: 0 var(--radius-md) var(--radius-md) 0;">
                        <i data-lucide="book-open" style="color: var(--primary);"></i>
                        <p style="margin: 0; font-size: 13px;">${c.guidance}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    return container;
}
