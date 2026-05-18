/**
 * MediDex Module (medidex.js)
 * View-Card Architecture
 */
import { fetchMockData } from '../utils.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    container.style.height = 'calc(100vh - 100px)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Categories
    const categories = ['All', 'Antibiotics', 'Pain Relief', 'Diabetes', 'Cardiac', 'Gastric', 'Allergy'];

    container.innerHTML = `
        <!-- TOP: Search & Filter -->
        <div style="padding: var(--space-3) 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <div class="search-bar" style="background: var(--bg-surface); border: 1px solid var(--border-color); width: 100%; max-width: 400px; padding: 10px 16px; border-radius: var(--radius-full);">
                <i data-lucide="search" class="search-icon" style="width: 18px; height: 18px; color: var(--text-tertiary);"></i>
                <input type="text" id="mx-search" placeholder="Search medicines, generics, or conditions..." style="font-size: 14px; background: transparent; border: none; outline: none; width: 100%; margin-left: 10px; color: var(--text-primary);">
            </div>
            
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;" id="mx-categories" class="hide-scrollbar">
                ${categories.map(c => `
                    <button class="btn ${c === 'All' ? 'btn-primary' : 'btn-outline'} mx-category-btn" data-cat="${c}" style="border-radius: var(--radius-full); padding: 6px 14px; font-size: 13px; font-weight: 500; flex-shrink: 0;">${c}</button>
                `).join('')}
            </div>
        </div>

        <!-- MAIN: Browsing Grid -->
        <div id="mx-grid" style="flex: 1; overflow-y: auto; padding: var(--space-4) 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-3); align-content: start;">
            <!-- Grid populated here -->
            <div style="height: 140px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); animation: pulse-subtle 1.5s infinite;"></div>
            <div style="height: 140px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); animation: pulse-subtle 1.5s infinite 0.1s;"></div>
            <div style="height: 140px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); animation: pulse-subtle 1.5s infinite 0.2s;"></div>
            <div style="height: 140px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); animation: pulse-subtle 1.5s infinite 0.3s;"></div>
        </div>

        <!-- SLIDE-OVER PANEL: Medicine Detail View -->
        <div id="mx-slide-panel" style="position: fixed; top: 0; right: -600px; width: 600px; max-width: 100vw; height: 100vh; background: var(--bg-surface); z-index: 2000; box-shadow: -10px 0 30px rgba(0,0,0,0.1); border-left: 1px solid var(--border-color); transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column;">
            
            <!-- Panel Header -->
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="icon-btn" id="mx-close-panel" style="background: var(--bg-surface); border: 1px solid var(--border-color);"><i data-lucide="chevron-right"></i></button>
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Clinical View</span>
                </div>
            </div>

            <!-- Panel Content -->
            <div id="mx-panel-content" style="flex: 1; overflow-y: auto; padding: 32px 32px 64px 32px;">
                <!-- Dynamically populated -->
            </div>
        </div>
        
        <!-- Panel Dim Overlay -->
        <div id="mx-panel-dim" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1999; backdrop-filter: blur(2px); opacity: 0; transition: opacity 0.3s;"></div>
    `;

    setTimeout(async () => {
        const medicines = await fetchMockData('medicines.json') || [];
        
        const searchInput = container.querySelector('#mx-search');
        const gridContainer = container.querySelector('#mx-grid');
        const slidePanel = container.querySelector('#mx-slide-panel');
        const panelContent = container.querySelector('#mx-panel-content');
        const panelDim = container.querySelector('#mx-panel-dim');
        const closeBtn = container.querySelector('#mx-close-panel');
        const catBtns = container.querySelectorAll('.mx-category-btn');
        let activeCat = 'All';

        const closePanel = () => {
            slidePanel.style.right = '-600px';
            panelDim.style.opacity = '0';
            setTimeout(() => panelDim.style.display = 'none', 300);
        };

        const openPanel = () => {
            panelDim.style.display = 'block';
            // Trigger reflow
            void panelDim.offsetWidth;
            panelDim.style.opacity = '1';
            slidePanel.style.right = '0';
        };

        closeBtn.addEventListener('click', closePanel);
        panelDim.addEventListener('click', closePanel);
        
        // Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && slidePanel.style.right === '0px') closePanel();
        });

        // Instant re-render, no fade
        const renderPanelContent = (med) => {
            panelContent.innerHTML = `
                <!-- HEADER -->
                <div style="margin-bottom: var(--space-4);">
                    <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: var(--text-primary);">${med.name}</h1>
                    <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 16px; font-weight: 500;">Generic: <span style="color: var(--text-primary);">${med.generic_name || 'N/A'}</span></div>
                    
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <span class="badge" style="background: rgba(20, 184, 166, 0.1); color: var(--primary); padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${med.category}</span>
                        ${med.prescription_required ? `<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px;"><i data-lucide="file-text" style="width: 14px; margin-right: 6px; vertical-align: middle;"></i> Rx Required</span>` : ''}
                    </div>
                </div>

                <!-- QUICK FACT STRIP -->
                <div style="display: flex; gap: 24px; margin-bottom: var(--space-6); background: var(--bg-hover); padding: 16px 24px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="flex: 1;">
                        <div style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px;">Dosage Form</div>
                        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${med.form || 'Tablet'}</div>
                    </div>
                    <div style="flex: 1; border-left: 1px solid var(--border-color); padding-left: 24px;">
                        <div style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px;">Strength</div>
                        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${med.strength || 'N/A'}</div>
                    </div>
                    <div style="flex: 1; border-left: 1px solid var(--border-color); padding-left: 24px;">
                        <div style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px;">Avg. Price</div>
                        <div style="font-size: 16px; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--text-primary);">${med.price_inr || '₹0.00'}</div>
                    </div>
                </div>

                <!-- CLINICAL USES -->
                <div style="margin-bottom: var(--space-5);">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;"><i data-lucide="check-circle-2" style="width: 16px; color: var(--primary);"></i> Clinical Uses</h3>
                    <ul style="margin: 0; padding-left: 24px; color: var(--text-primary); font-size: 15px; line-height: 1.6;">
                        ${(med.usage || []).map(u => `<li style="margin-bottom: 4px;">${u}</li>`).join('')}
                    </ul>
                </div>

                <!-- DOSAGE GUIDANCE -->
                <div style="margin-bottom: var(--space-5);">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;"><i data-lucide="info" style="width: 16px; color: var(--accent);"></i> Dosage Guidance</h3>
                    <p style="font-size: 15px; line-height: 1.6; margin: 0; color: var(--text-primary); background: rgba(56, 189, 248, 0.05); border-left: 3px solid var(--accent); padding: 16px; border-radius: 0 8px 8px 0;">
                        ${med.dosage}
                    </p>
                </div>

                <!-- SIDE EFFECTS & WARNINGS -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6);">
                    <div style="background: var(--bg-hover); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Common Side Effects</h3>
                        <ul style="margin: 0; padding-left: 20px; color: var(--text-primary); font-size: 14px; line-height: 1.6;">
                            ${(med.side_effects || []).map(se => `<li>${se}</li>`).join('') || '<li>Minimal reported side effects.</li>'}
                        </ul>
                    </div>
                    <div style="background: rgba(239, 68, 68, 0.03); padding: 20px; border-radius: var(--radius-md); border: 1px solid rgba(239, 68, 68, 0.2);">
                        <h3 style="font-size: 13px; color: var(--danger); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Warnings</h3>
                        <ul style="margin: 0; padding-left: 20px; color: var(--danger); font-size: 14px; line-height: 1.6; font-weight: 500;">
                            ${(med.warnings || []).map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: var(--space-5);">
                    <!-- SUBSTITUTES -->
                    <div style="margin-bottom: var(--space-5);">
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">Substitutes</h3>
                        ${(med.substitutes || []).length > 0 ? `
                            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                ${med.substitutes.map(subName => `
                                    <button class="sub-btn" data-name="${subName}" style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 10px 16px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; color: var(--text-primary); cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                                        ${subName}
                                    </button>
                                `).join('')}
                            </div>
                        ` : `<p style="font-size: 14px; color: var(--text-tertiary); margin: 0;">No common exact substitutes available in database.</p>`}
                    </div>

                    <!-- RELATED CONDITIONS -->
                    <div>
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">Related Conditions</h3>
                        ${(med.related_conditions || []).length > 0 ? `
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${med.related_conditions.map(c => `
                                    <span style="background: var(--bg-hover); border: 1px solid var(--border-color); padding: 6px 14px; border-radius: var(--radius-full); font-size: 13px; color: var(--text-secondary); font-weight: 500;">
                                        ${c}
                                    </span>
                                `).join('')}
                            </div>
                        ` : `<p style="font-size: 14px; color: var(--text-tertiary); margin: 0;">None specified.</p>`}
                    </div>
                </div>
            `;
            if(window.lucide) window.lucide.createIcons();

            // Instant substitute click handler
            panelContent.querySelectorAll('.sub-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetName = e.target.dataset.name.toLowerCase();
                    const foundMed = medicines.find(m => m.name.toLowerCase() === targetName || m.name.toLowerCase().includes(targetName));
                    if (foundMed) {
                        renderPanelContent(foundMed); // Instant re-render, no closing
                        panelContent.scrollTop = 0; // Scroll back to top
                    } else {
                        window.toast && window.toast.show(`"${e.target.dataset.name}" not in database.`, 'warning');
                    }
                });
                btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; btn.style.transform = 'translateY(-1px)'; });
                btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'var(--border-color)'; btn.style.color = 'var(--text-primary)'; btn.style.transform = 'translateY(0)'; });
            });
        };

        const renderGrid = (query = '') => {
            const q = query.toLowerCase();
            const filtered = medicines.filter(m => {
                const matchQuery = m.name.toLowerCase().includes(q) || (m.generic_name || '').toLowerCase().includes(q) || (m.related_conditions || []).some(c => c.toLowerCase().includes(q));
                const matchCat = activeCat === 'All' || m.category.toLowerCase() === activeCat.toLowerCase();
                return matchQuery && matchCat;
            }).slice(0, 50);

            if (filtered.length === 0) {
                gridContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 20px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
                        <i data-lucide="search-x" style="color: var(--text-tertiary); margin-bottom: 16px; width: 48px; height: 48px;"></i>
                        <h3 style="font-size: 18px; color: var(--text-primary); margin-bottom: 8px;">No medicine found for "${query}"</h3>
                        <p style="font-size: 14px; color: var(--text-secondary); max-width: 300px;">Try searching by generic name (e.g., 'Paracetamol') or by condition (e.g., 'Fever').</p>
                    </div>
                `;
            } else {
                gridContainer.innerHTML = filtered.map(med => `
                    <div class="mx-card" data-id="${med.id}" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <h4 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: var(--text-primary);">${med.name}</h4>
                            <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">${med.generic_name || 'Generic N/A'}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 14px; color: var(--text-primary); line-height: 1.5; background: var(--bg-hover); padding: 10px; border-radius: 6px;">
                                ${(med.usage || [])[0] || 'Clinical use not specified.'}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                            <span style="background: rgba(20, 184, 166, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">${med.category}</span>
                            ${med.prescription_required ? `<span style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Rx Required</span>` : ''}
                            ${med.strength ? `<span style="border: 1px solid var(--border-color); color: var(--text-secondary); padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">${med.strength}</span>` : ''}
                        </div>
                    </div>
                `).join('');
                
                gridContainer.querySelectorAll('.mx-card').forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        card.style.transform = 'translateY(-2px)';
                        card.style.boxShadow = 'var(--shadow-md)';
                        card.style.borderColor = 'var(--primary)';
                    });
                    card.addEventListener('mouseleave', () => {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = 'var(--shadow-sm)';
                        card.style.borderColor = 'var(--border-color)';
                    });
                    card.addEventListener('click', () => {
                        const med = medicines.find(m => m.id === parseInt(card.dataset.id));
                        if (med) {
                            renderPanelContent(med);
                            openPanel();
                        }
                    });
                });
            }
            if(window.lucide) window.lucide.createIcons();
        };

        searchInput.addEventListener('input', (e) => renderGrid(e.target.value));
        
        catBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                catBtns.forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-outline');
                });
                e.target.classList.add('btn-primary');
                e.target.classList.remove('btn-outline');
                activeCat = e.target.dataset.cat;
                renderGrid(searchInput.value);
            });
        });

        renderGrid();

    }, 0);

    return container;
}
