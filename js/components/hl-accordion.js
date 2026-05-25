/**
 * Health Library — Accordion Component (hl-accordion.js)
 * Collapsible content sections with smooth transitions.
 *
 * Exports:
 *   createAccordionSection()  — DOM element factory
 *   buildSymptomGridHTML()    — Symptom card grid
 *   buildBulletListHTML()     — Generic bullet list
 *   buildWarningListHTML()    — Warning-styled list (doctor visits)
 *   buildMedicineListHTML()   — Medicine mini-card list
 */

/**
 * Creates a collapsible accordion section element.
 * @param {Object} opts
 * @param {string} opts.id        — Unique section identifier
 * @param {string} opts.title     — Section heading text
 * @param {string} opts.icon      — Lucide icon name
 * @param {string} opts.contentHTML — Pre-built inner HTML
 * @param {boolean} [opts.expanded=false] — Start expanded
 * @returns {HTMLElement}
 */
export function createAccordionSection({ id, title, icon, contentHTML, expanded = false }) {
    const item = document.createElement('div');
    item.className = `hl-accordion-item${expanded ? ' expanded' : ''}`;
    item.dataset.sectionId = id;

    item.innerHTML = `
        <button class="hl-accordion-header" aria-expanded="${expanded}" aria-controls="hl-sec-${id}">
            <span class="hl-accordion-icon"><i data-lucide="${icon}"></i></span>
            <span class="hl-accordion-label">${title}</span>
            <i data-lucide="chevron-down" class="hl-accordion-chevron"></i>
        </button>
        <div class="hl-accordion-content" id="hl-sec-${id}" role="region">
            <div class="hl-accordion-inner">
                ${contentHTML}
            </div>
        </div>
    `;

    const header = item.querySelector('.hl-accordion-header');
    header.addEventListener('click', () => {
        const isExpanded = item.classList.toggle('expanded');
        header.setAttribute('aria-expanded', String(isExpanded));
    });

    return item;
}

/**
 * Builds symptom card grid HTML.
 * @param {Array<{name: string, description: string}>} symptoms
 * @param {string} [highlightSymptom=''] — Symptom name to highlight
 * @returns {string} HTML string
 */
export function buildSymptomGridHTML(symptoms, highlightSymptom = '') {
    const hl = highlightSymptom.toLowerCase();
    return `
        <div class="hl-symptom-grid">
            ${symptoms.map(s => {
                const isHighlighted = hl && s.name.toLowerCase().includes(hl);
                return `
                <div class="hl-symptom-card${isHighlighted ? ' highlight' : ''}" data-symptom="${s.name.toLowerCase()}">
                    <p class="hl-symptom-name">${s.name}</p>
                    <p class="hl-symptom-desc">${s.description}</p>
                </div>`;
            }).join('')}
        </div>
    `;
}

/**
 * Builds a generic bullet list.
 * @param {string[]} items
 * @returns {string} HTML string
 */
export function buildBulletListHTML(items) {
    return `
        <ul class="hl-bullet-list">
            ${items.map(item => `
                <li class="hl-bullet-item">
                    <span class="hl-bullet-dot"></span>
                    <span>${item}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

/**
 * Builds warning-styled list (for "When to See a Doctor").
 * @param {string[]} items
 * @returns {string} HTML string
 */
export function buildWarningListHTML(items) {
    return `
        <ul class="hl-warning-list">
            ${items.map(item => `
                <li class="hl-warning-item">
                    <i data-lucide="alert-circle"></i>
                    <span>${item}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

/**
 * Builds medicine mini-card list.
 * @param {Array<{name: string, purpose: string}>} medicines
 * @returns {string} HTML string
 */
export function buildMedicineListHTML(medicines) {
    return `
        <div class="hl-medicine-list">
            ${medicines.map(m => `
                <div class="hl-medicine-card">
                    <span class="hl-medicine-icon"><i data-lucide="pill"></i></span>
                    <div>
                        <p class="hl-medicine-name">${m.name}</p>
                        <p class="hl-medicine-purpose">${m.purpose}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
