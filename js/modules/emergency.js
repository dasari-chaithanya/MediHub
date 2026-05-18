/**
 * Emergency Module (emergency.js)
 */

export async function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    container.innerHTML = `
        <div class="card-surface mb-4" style="border-left: 4px solid var(--danger);">
            <h2 style="color: var(--danger);"><i data-lucide="alert-triangle" style="vertical-align: middle; margin-right: 8px;"></i> Emergency Assistance</h2>
            <p>Immediate access to critical resources and first aid guidance.</p>
        </div>

        <div class="bento-grid" style="grid-template-columns: 1fr;">
            
            <!-- Helpline Card -->
            <div class="card-surface mb-4" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                    <div>
                        <h3 style="color: var(--danger); margin-bottom: 4px;">National Emergency Number</h3>
                        <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">Available 24/7 for medical, fire, or police emergencies.</p>
                    </div>
                    <a href="tel:112" class="btn" style="background: var(--danger); color: white; font-size: 20px; font-weight: 700; font-family: 'Sora', sans-serif; padding: 12px 32px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                        <i data-lucide="phone" style="width: 24px; height: 24px;"></i> 112
                    </a>
                </div>
            </div>

            <!-- Single-open Accordion for First Aid -->
            <h3 class="mb-3">First Aid Guides</h3>
            <div class="accordion-container" id="emergency-accordion">
                
                <!-- Item 1 -->
                <div class="accordion-item card-surface mb-2" style="padding: 0; overflow: hidden; cursor: pointer;">
                    <div class="accordion-header" style="padding: var(--space-3); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <div style="background: var(--bg-hover); padding: 8px; border-radius: 8px; color: var(--text-primary);"><i data-lucide="heart-pulse"></i></div>
                            <h4 style="margin: 0;">CPR (Cardiopulmonary Resuscitation)</h4>
                        </div>
                        <i data-lucide="chevron-down" class="acc-icon transition-transform"></i>
                    </div>
                    <div class="accordion-body" style="max-height: 0; overflow: hidden; transition: max-height var(--duration-normal) var(--ease-premium);">
                        <div style="padding: 0 var(--space-3) var(--space-3) var(--space-3);">
                            <div style="height: 1px; background: var(--border-color); margin-bottom: var(--space-3);"></div>
                            <ol style="padding-left: 20px; font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
                                <li><strong>Check the scene:</strong> Ensure it's safe to approach.</li>
                                <li><strong>Check responsiveness:</strong> Tap the shoulder and shout, "Are you OK?"</li>
                                <li><strong>Call for help:</strong> Call 112 immediately.</li>
                                <li><strong>Start Compressions:</strong> Push hard and fast in the center of the chest (100-120 beats per minute).</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <!-- Item 2 -->
                <div class="accordion-item card-surface mb-2" style="padding: 0; overflow: hidden; cursor: pointer;">
                    <div class="accordion-header" style="padding: var(--space-3); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <div style="background: var(--bg-hover); padding: 8px; border-radius: 8px; color: var(--text-primary);"><i data-lucide="flame"></i></div>
                            <h4 style="margin: 0;">Burns</h4>
                        </div>
                        <i data-lucide="chevron-down" class="acc-icon transition-transform"></i>
                    </div>
                    <div class="accordion-body" style="max-height: 0; overflow: hidden; transition: max-height var(--duration-normal) var(--ease-premium);">
                        <div style="padding: 0 var(--space-3) var(--space-3) var(--space-3);">
                            <div style="height: 1px; background: var(--border-color); margin-bottom: var(--space-3);"></div>
                            <ul style="padding-left: 20px; font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
                                <li><strong>Cool the burn:</strong> Hold under cool (not cold) running water for 10-15 minutes.</li>
                                <li><strong>Remove tight items:</strong> Rings or other tight items from the burned area before it swells.</li>
                                <li><strong>Don't break blisters:</strong> Broken blisters are vulnerable to infection.</li>
                                <li><strong>Apply lotion:</strong> Once cool, apply aloe vera or a moisturizer.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Item 3 -->
                <div class="accordion-item card-surface mb-2" style="padding: 0; overflow: hidden; cursor: pointer;">
                    <div class="accordion-header" style="padding: var(--space-3); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            <div style="background: var(--bg-hover); padding: 8px; border-radius: 8px; color: var(--text-primary);"><i data-lucide="wind"></i></div>
                            <h4 style="margin: 0;">Choking</h4>
                        </div>
                        <i data-lucide="chevron-down" class="acc-icon transition-transform"></i>
                    </div>
                    <div class="accordion-body" style="max-height: 0; overflow: hidden; transition: max-height var(--duration-normal) var(--ease-premium);">
                        <div style="padding: 0 var(--space-3) var(--space-3) var(--space-3);">
                            <div style="height: 1px; background: var(--border-color); margin-bottom: var(--space-3);"></div>
                            <p style="font-size: 14px; color: var(--text-secondary);">If the person cannot cough, speak, or breathe:</p>
                            <ul style="padding-left: 20px; font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
                                <li>Stand behind them and wrap your arms around their waist.</li>
                                <li>Make a fist and place it just above their navel.</li>
                                <li>Grab your fist with your other hand.</li>
                                <li>Give 5 quick, upward thrusts (Heimlich maneuver).</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    setTimeout(() => {
        const accordion = container.querySelector('#emergency-accordion');
        const items = accordion.querySelectorAll('.accordion-item');

        items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const body = item.querySelector('.accordion-body');
            const icon = item.querySelector('.acc-icon');

            header.addEventListener('click', () => {
                const isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';

                // Close all
                items.forEach(otherItem => {
                    otherItem.querySelector('.accordion-body').style.maxHeight = null;
                    otherItem.querySelector('.acc-icon').style.transform = 'rotate(0deg)';
                });

                // Toggle current
                if (!isOpen) {
                    body.style.maxHeight = body.scrollHeight + "px";
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }, 0);

    return container;
}
