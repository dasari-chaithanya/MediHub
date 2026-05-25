/**
 * Health Library — Drawer Component (hl-drawer.js)
 * Right-side slide drawer with focus trap, keyboard accessibility,
 * and accordion-based content rendering.
 *
 * Usage:
 *   const drawer = createDrawer(parentContainer);
 *   drawer.open(conditionObject);
 *   drawer.open(conditionObject, 'fever'); // highlight symptom
 *   drawer.close();
 */
import {
    createAccordionSection,
    buildSymptomGridHTML,
    buildBulletListHTML,
    buildWarningListHTML,
    buildMedicineListHTML,
} from './hl-accordion.js';

/** Accordion section definitions — order matters */
const SECTIONS = [
    { id: 'symptoms',        title: 'Common Symptoms',               icon: 'thermometer',    key: 'commonSymptoms' },
    { id: 'risk-factors',    title: 'Risk Factors',                  icon: 'alert-triangle', key: 'riskFactors' },
    { id: 'general-care',    title: 'General Care',                  icon: 'heart-pulse',    key: 'generalCare' },
    { id: 'when-to-see-doc', title: 'When to See a Doctor',          icon: 'stethoscope',    key: 'whenToSeeDoctor' },
    { id: 'prevention',      title: 'Prevention',                    icon: 'shield-check',   key: 'prevention' },
    { id: 'medicines',       title: 'Commonly Referenced Medicines', icon: 'pill',            key: 'referencedMedicines' },
];

/**
 * Creates and attaches a drawer to the given container.
 * @param {HTMLElement} container — Parent element to append drawer to
 * @returns {{ open: Function, close: Function, element: HTMLElement }}
 */
export function createDrawer(container) {
    // --- Create DOM elements ---
    const dim = document.createElement('div');
    dim.className = 'hl-drawer-dim';

    const drawer = document.createElement('div');
    drawer.className = 'hl-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Health condition details');

    drawer.innerHTML = `
        <div class="hl-drawer-header">
            <div style="min-width: 0;">
                <h2 class="hl-drawer-title"></h2>
                <span class="hl-drawer-category-badge"></span>
            </div>
            <button class="icon-btn hl-drawer-close" aria-label="Close drawer"
                    style="background: var(--bg-surface); border: 1px solid var(--border-color); flex-shrink: 0;">
                <i data-lucide="x"></i>
            </button>
        </div>
        <div class="hl-drawer-body">
            <div class="hl-drawer-overview"></div>
            <div class="hl-accordion"></div>
        </div>
    `;

    container.appendChild(dim);
    container.appendChild(drawer);

    // --- Cache references ---
    const titleEl     = drawer.querySelector('.hl-drawer-title');
    const categoryEl  = drawer.querySelector('.hl-drawer-category-badge');
    const overviewEl  = drawer.querySelector('.hl-drawer-overview');
    const accordionEl = drawer.querySelector('.hl-accordion');
    const closeBtn    = drawer.querySelector('.hl-drawer-close');
    const bodyEl      = drawer.querySelector('.hl-drawer-body');

    let previouslyFocused = null;
    let isOpen = false;

    // --- Close ---
    const close = () => {
        if (!isOpen) return;
        isOpen = false;
        drawer.classList.remove('open');
        dim.classList.remove('active');
        document.body.style.overflow = '';

        // Restore focus
        if (previouslyFocused) {
            previouslyFocused.focus();
            previouslyFocused = null;
        }

        document.removeEventListener('keydown', handleKeyDown);
    };

    // --- Keyboard handler (Escape + Focus Trap) ---
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            close();
            return;
        }

        // Focus trap — cycle Tab within drawer
        if (e.key === 'Tab') {
            const focusable = drawer.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    // --- Build content for a specific section ---
    const buildSectionContent = (sectionDef, data, highlightSymptom) => {
        switch (sectionDef.id) {
            case 'symptoms':
                return buildSymptomGridHTML(data, highlightSymptom);
            case 'when-to-see-doc':
                return buildWarningListHTML(data);
            case 'medicines':
                return buildMedicineListHTML(data);
            default:
                return buildBulletListHTML(data);
        }
    };

    // --- Open ---
    const open = (condition, highlightSymptom = '') => {
        previouslyFocused = document.activeElement;
        isOpen = true;

        // --- Populate header ---
        titleEl.textContent = condition.name;
        categoryEl.textContent = condition.category;

        // --- Populate overview ---
        const overviewText = condition.overview || condition.description;
        if (overviewText.includes('\n')) {
            overviewEl.innerHTML = overviewText
                .split('\n')
                .filter(p => p.trim())
                .map(p => `<p>${p.trim()}</p>`)
                .join('');
        } else {
            overviewEl.innerHTML = `<p>${overviewText}</p>`;
        }

        // --- Build accordion sections ---
        accordionEl.innerHTML = '';

        SECTIONS.forEach(section => {
            const data = condition[section.key];
            if (!data || (Array.isArray(data) && data.length === 0)) return;

            const shouldExpand = !!(highlightSymptom && section.id === 'symptoms');
            const contentHTML = buildSectionContent(section, data, highlightSymptom);

            const el = createAccordionSection({
                id: section.id,
                title: section.title,
                icon: section.icon,
                contentHTML,
                expanded: shouldExpand,
            });

            accordionEl.appendChild(el);
        });

        // --- Show drawer ---
        drawer.classList.add('open');
        dim.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Render Lucide icons inside drawer
        if (window.lucide) window.lucide.createIcons();

        // Focus management
        closeBtn.focus();
        document.addEventListener('keydown', handleKeyDown);

        // Scroll to top or to highlighted section
        bodyEl.scrollTop = 0;

        if (highlightSymptom) {
            requestAnimationFrame(() => {
                const target = accordionEl.querySelector('[data-section-id="symptoms"]');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    };

    // --- Event listeners ---
    closeBtn.addEventListener('click', close);
    dim.addEventListener('click', close);

    return { open, close, element: drawer };
}
