/**
 * MediDex Module (medidex.js)
 * Production-grade View-Card Architecture
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
            <div class="search-bar" style="background: var(--bg-surface); border: 1px solid var(--border-color); width: 100%; max-width: 400px; padding: 12px 18px; border-radius: var(--radius-full); transition: all 0.2s var(--ease-premium);">
                <i data-lucide="search" class="search-icon" style="width: 18px; height: 18px; color: var(--text-tertiary);"></i>
                <input type="text" id="mx-search" placeholder="Search medicines, generics, or conditions..." style="font-size: 14px; background: transparent; border: none; outline: none; width: 100%; margin-left: 10px; color: var(--text-primary);">
            </div>
            
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;" id="mx-categories" class="hide-scrollbar">
                ${categories.map(c => `
                    <button class="btn ${c === 'All' ? 'btn-primary' : 'btn-outline'} mx-category-btn" data-cat="${c}" style="border-radius: var(--radius-full); padding: 8px 16px; font-size: 13px; font-weight: 500; flex-shrink: 0; transition: all 0.2s;">${c}</button>
                `).join('')}
            </div>
        </div>

        <!-- MAIN: Browsing Grid -->
        <div id="mx-grid" style="flex: 1; overflow-y: auto; padding: var(--space-4) 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-4); align-content: start;">
            <!-- Skeletons -->
            <div class="skeleton-box" style="height: 200px; border-radius: var(--radius-lg);"></div>
            <div class="skeleton-box" style="height: 200px; border-radius: var(--radius-lg); animation-delay: 0.1s;"></div>
            <div class="skeleton-box" style="height: 200px; border-radius: var(--radius-lg); animation-delay: 0.2s;"></div>
            <div class="skeleton-box" style="height: 200px; border-radius: var(--radius-lg); animation-delay: 0.3s;"></div>
        </div>

        <!-- SLIDE-OVER PANEL: Medicine Detail View -->
        <div id="mx-slide-panel" style="position: fixed; top: 0; right: -600px; width: 600px; max-width: 100vw; height: 100vh; background: var(--bg-surface); z-index: 2000; box-shadow: -10px 0 40px rgba(0,0,0,0.08); border-left: 1px solid var(--border-color); transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column;">
            
            <!-- Sticky Panel Header -->
            <div style="position: sticky; top: 0; padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 10;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="icon-btn" id="mx-close-panel" style="background: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"><i data-lucide="chevron-right" style="width: 18px; color: var(--text-secondary);"></i></button>
                    <span style="font-size: 12px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Clinical View</span>
                </div>
            </div>

            <!-- Scrollable Panel Content -->
            <div id="mx-panel-content" class="custom-scrollbar" style="flex: 1; overflow-y: auto; padding: 32px;">
                <!-- Dynamically populated -->
            </div>
        </div>
        
        <!-- Panel Dim Overlay -->
        <div id="mx-panel-dim" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.2); z-index: 1999; backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); opacity: 0; transition: opacity 0.3s ease;"></div>
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

        const searchBarWrap = searchInput.parentElement;
        searchInput.addEventListener('focus', () => {
            searchBarWrap.style.borderColor = 'var(--primary)';
            searchBarWrap.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
        });
        searchInput.addEventListener('blur', () => {
            searchBarWrap.style.borderColor = 'var(--border-color)';
            searchBarWrap.style.boxShadow = 'none';
        });

        const closePanel = () => {
            slidePanel.style.right = '-600px';
            panelDim.style.opacity = '0';
            setTimeout(() => panelDim.style.display = 'none', 300);
        };

        const openPanel = () => {
            panelDim.style.display = 'block';
            void panelDim.offsetWidth; // force reflow
            panelDim.style.opacity = '1';
            slidePanel.style.right = '0';
        };

        closeBtn.addEventListener('click', closePanel);
        panelDim.addEventListener('click', closePanel);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && slidePanel.style.right === '0px') closePanel();
        });

        const renderPanelContent = (med) => {
            panelContent.innerHTML = `
                <!-- HEADER -->
                <div style="margin-bottom: 32px;">
                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
                        <span style="background: rgba(20, 184, 166, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${med.category}</span>
                        ${med.prescription_required ? `<span style="background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;"><i data-lucide="file-text" style="width: 12px; margin-right: 4px; vertical-align: middle;"></i> Rx Required</span>` : ''}
                    </div>
                    <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px;">${med.name}</h1>
                    <div style="font-size: 15px; color: var(--text-secondary);">Generic: <span style="font-weight: 500; color: var(--text-primary);">${med.generic_name || 'N/A'}</span></div>
                </div>

                <!-- INFO GRID -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; background: var(--bg-surface); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Dosage Form</span>
                        <span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${med.form || 'Tablet'}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px; border-left: 1px solid var(--border-color); padding-left: 16px;">
                        <span style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Strength</span>
                        <span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${med.strength || 'N/A'}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px; border-left: 1px solid var(--border-color); padding-left: 16px;">
                        <span style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Avg. Price</span>
                        <span style="font-size: 16px; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--text-primary);">${med.price_inr || '₹0.00'}</span>
                    </div>
                </div>

                <!-- CLINICAL USES -->
                <div style="margin-bottom: 32px;">
                    <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;"><i data-lucide="check-circle-2" style="width: 16px; color: var(--primary);"></i> Clinical Uses</h3>
                    <ul style="margin: 0; padding-left: 20px; color: var(--text-primary); font-size: 14px; line-height: 1.6;">
                        ${(med.usage || []).map(u => `<li style="margin-bottom: 6px;">${u}</li>`).join('')}
                    </ul>
                </div>

                <!-- DOSAGE GUIDANCE -->
                <div style="margin-bottom: 32px;">
                    <h3 style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;"><i data-lucide="info" style="width: 16px; color: var(--accent);"></i> Dosage Guidance</h3>
                    <div style="background: rgba(56, 189, 248, 0.05); border-left: 3px solid var(--accent); padding: 16px 20px; border-radius: 0 var(--radius-md) var(--radius-md) 0;">
                        <p style="font-size: 14px; line-height: 1.6; margin: 0; color: var(--text-primary);">${med.dosage}</p>
                    </div>
                </div>

                <!-- SIDE EFFECTS & WARNINGS GRID -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
                    <!-- Side Effects -->
                    <div style="background: var(--bg-hover); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                        <h3 style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Common Side Effects</h3>
                        <ul style="margin: 0; padding-left: 18px; color: var(--text-primary); font-size: 14px; line-height: 1.6;">
                            ${(med.side_effects || []).map(se => `<li style="margin-bottom: 4px;">${se}</li>`).join('') || '<li>Minimal reported side effects.</li>'}
                        </ul>
                    </div>
                    
                    <!-- Warnings -->
                    <div style="background: rgba(239, 68, 68, 0.04); padding: 24px; border-radius: var(--radius-lg); border: 1px solid rgba(239, 68, 68, 0.15);">
                        <h3 style="font-size: 12px; color: var(--danger); margin-bottom: 16px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Warnings</h3>
                        <ul style="margin: 0; padding-left: 18px; color: var(--danger); font-size: 14px; line-height: 1.6; font-weight: 500;">
                            ${(med.warnings || []).map(w => `<li style="margin-bottom: 4px;">${w}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 32px; padding-bottom: 32px;">
                    <!-- SUBSTITUTES -->
                    <div style="margin-bottom: 32px;">
                        <h3 style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Substitutes</h3>
                        ${(med.substitutes || []).length > 0 ? `
                            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                                ${med.substitutes.map(subName => `
                                    <button class="sub-btn" data-name="${subName}" style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: var(--radius-full); font-size: 13px; font-weight: 500; color: var(--text-primary); cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);">
                                        ${subName}
                                    </button>
                                `).join('')}
                            </div>
                        ` : `<p style="font-size: 14px; color: var(--text-tertiary); margin: 0;">No common exact substitutes available in database.</p>`}
                    </div>

                    <!-- RELATED CONDITIONS -->
                    <div>
                        <h3 style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Related Conditions</h3>
                        ${(med.related_conditions || []).length > 0 ? `
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${med.related_conditions.map(c => `
                                    <span style="background: var(--bg-hover); border: 1px solid transparent; padding: 6px 14px; border-radius: var(--radius-full); font-size: 13px; color: var(--text-secondary); font-weight: 500;">
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
                        renderPanelContent(foundMed);
                        panelContent.scrollTop = 0; 
                    } else {
                        window.toast && window.toast.show(`"${e.target.dataset.name}" not found in database.`, 'warning');
                    }
                });
                btn.addEventListener('mouseenter', () => { 
                    btn.style.borderColor = 'var(--primary)'; 
                    btn.style.color = 'var(--primary)'; 
                    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                });
                btn.addEventListener('mouseleave', () => { 
                    btn.style.borderColor = 'var(--border-color)'; 
                    btn.style.color = 'var(--text-primary)'; 
                    btn.style.boxShadow = 'var(--shadow-sm)';
                });
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
                        <h3 style="font-size: 18px; color: var(--text-primary); margin-bottom: 8px;">No results found for "${query}"</h3>
                        <p style="font-size: 14px; color: var(--text-secondary); max-width: 300px;">Try searching by generic name (e.g., 'Paracetamol') or by condition (e.g., 'Fever').</p>
                    </div>
                `;
            } else {
                gridContainer.innerHTML = filtered.map(med => `
                    <div class="mx-card" data-id="${med.id}" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                            <div>
                                <h4 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px;">${med.name}</h4>
                                <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">${med.generic_name || 'Generic N/A'}</div>
                            </div>
                            <span style="background: rgba(20, 184, 166, 0.08); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap;">${med.category}</span>
                        </div>
                        
                        <div style="flex: 1;">
                            <p style="margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                                ${(med.usage || [])[0] || 'Clinical use not specified.'}
                            </p>
                        </div>
                        
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px;">
                            ${med.prescription_required ? `<span style="color: var(--danger); font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i data-lucide="file-text" style="width: 14px;"></i> Rx</span>` : `<span style="color: var(--success); font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i data-lucide="check-circle-2" style="width: 14px;"></i> OTC</span>`}
                            <span style="color: var(--border-color);">•</span>
                            <span style="color: var(--text-secondary); font-size: 12px; font-weight: 500;">${med.form || 'Tablet'}</span>
                            ${med.strength ? `
                                <span style="color: var(--border-color);">•</span>
                                <span style="color: var(--text-secondary); font-size: 12px; font-weight: 600;">${med.strength}</span>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
                
                gridContainer.querySelectorAll('.mx-card').forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        card.style.transform = 'translateY(-3px)';
                        card.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.06), 0 4px 8px -4px rgba(0,0,0,0.04)';
                        card.style.borderColor = 'var(--primary)';
                    });
                    card.addEventListener('mouseleave', () => {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                        card.style.borderColor = 'var(--border-color)';
                    });
                    card.addEventListener('click', () => {
                        const med = medicines.find(m => m.id === card.dataset.id || m.id === parseInt(card.dataset.id));
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
