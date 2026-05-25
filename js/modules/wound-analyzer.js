/**
 * Wound Analyzer Module (wound-analyzer.js)
 * Clean, restrained SaaS UI.
 */
import { appState, events } from '../state.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'analyzer-container animate-fade-in stagger-1';

    container.innerHTML = `
        <div style="margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-4);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%;"></div>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase;">Simulated Assessment Tool</span>
            </div>
            <h1 style="font-size: 28px; margin-bottom: 8px; color: var(--text-primary);">Wound Image Analysis</h1>
            <p style="color: var(--text-secondary); font-size: 15px; max-width: 600px; margin: 0; line-height: 1.5;">Upload a clear picture of a wound to receive an estimated severity assessment. <strong>This is an educational simulation, not medical advice.</strong></p>
        </div>

        <!-- Step 1: Upload Zone -->
        <div id="wa-upload-zone" style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--bg-surface);">
            <input type="file" id="wa-file-input" accept="image/*" class="hide" style="display: none;">
            <div id="wa-idle-state" style="pointer-events: none;">
                <div style="margin: 0 auto 16px; width: 48px; height: 48px; background: var(--bg-hover); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                    <i data-lucide="upload-cloud" style="width: 24px; height: 24px;"></i>
                </div>
                <div style="font-size: 16px; font-weight: 500; color: var(--text-primary);">Drag and drop or click to upload</div>
                <div style="font-size: 13px; color: var(--text-tertiary); margin-top: 8px;">Supports JPG, PNG (Max 10MB)</div>
            </div>
        </div>

        <!-- Step 2: Linear Analysis Stepper -->
        <div id="wa-analysis-state" class="card-surface" style="display: none; border: 1px solid var(--border-color);">
            <h3 style="margin: 0 0 24px 0; font-size: 16px; font-weight: 600;">Processing Image</h3>
            
            <div id="wa-stages" style="display: flex; flex-direction: column; gap: 16px;">
                <div class="wa-stage" id="stage-1" style="display: flex; align-items: center; gap: 12px; color: var(--text-tertiary); font-size: 14px;">
                    <div class="stage-icon" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); flex-shrink: 0;"></div>
                    <span>Uploading secure payload...</span>
                </div>
                <div class="wa-stage" id="stage-2" style="display: flex; align-items: center; gap: 12px; color: var(--text-tertiary); font-size: 14px;">
                    <div class="stage-icon" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); flex-shrink: 0;"></div>
                    <span>Normalizing image contrast and color...</span>
                </div>
                <div class="wa-stage" id="stage-3" style="display: flex; align-items: center; gap: 12px; color: var(--text-tertiary); font-size: 14px;">
                    <div class="stage-icon" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); flex-shrink: 0;"></div>
                    <span>Detecting visual tissue patterns...</span>
                </div>
                <div class="wa-stage" id="stage-4" style="display: flex; align-items: center; gap: 12px; color: var(--text-tertiary); font-size: 14px;">
                    <div class="stage-icon" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border-color); flex-shrink: 0;"></div>
                    <span>Cross-referencing symptom map...</span>
                </div>
            </div>
            
            <div style="margin-top: 24px; height: 4px; background: var(--bg-hover); border-radius: 2px; overflow: hidden;">
                <div id="wa-progress-bar" style="height: 100%; width: 0%; background: var(--primary); transition: width 0.8s ease;"></div>
            </div>
        </div>

        <!-- Step 3: Results -->
        <div id="wa-results" class="animate-slide-up" style="display: none; border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden;">
            <div style="background: var(--bg-surface); padding: 24px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 8px;">Analysis Complete</div>
                        <h3 style="margin: 0; font-size: 20px;">Superficial Abrasion</h3>
                    </div>
                    <div style="text-align: right; width: 160px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: var(--text-secondary); font-weight: 500;">
                            <span>Visual Match Strength</span>
                            <strong style="color: var(--text-primary);">87%</strong>
                        </div>
                        <div style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                            <div id="wa-confidence-fill" style="background: var(--primary); width: 0%; height: 100%; transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                        </div>
                    </div>
                </div>

                <div style="background: var(--bg-app); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 24px;">
                    <h4 style="font-size: 14px; margin: 0 0 8px 0; color: var(--text-primary); display: flex; align-items: center; gap: 8px;"><i data-lucide="file-text" style="width: 16px;"></i> Observation Notes</h4>
                    <p style="margin:0; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">The uploaded image exhibits characteristics consistent with a superficial epidermal abrasion. Mild inflammatory response (redness) is visible, but no deep tissue exposure or severe necrotic indicators were detected. The visual signature strongly aligns with minor friction injuries.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <h4 style="font-size: 14px; margin: 0 0 12px 0; color: var(--text-primary);">General Care Guidelines</h4>
                        <ul style="padding-left: 20px; margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                            <li>Clean gently with mild soap and water.</li>
                            <li>Pat dry with a clean, lint-free cloth.</li>
                            <li>Apply an over-the-counter antiseptic if available.</li>
                            <li>Cover with a sterile bandage to prevent infection.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="font-size: 14px; margin: 0 0 12px 0; color: var(--text-primary);">When to See a Doctor</h4>
                        <ul style="padding-left: 20px; margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                            <li>If redness or swelling spreads significantly.</li>
                            <li>If the wound feels warm to the touch.</li>
                            <li>If you develop a fever.</li>
                            <li>If you haven't had a tetanus shot in the last 10 years.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style="background: var(--bg-hover); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
                <p style="margin: 0; font-size: 12px; color: var(--text-tertiary);"><i data-lucide="alert-triangle" style="width: 12px; vertical-align: middle; margin-right: 4px;"></i> Not a medical diagnosis.</p>
                <button class="btn btn-primary" id="wa-reset-btn" style="padding: 8px 16px; font-size: 13px;">Analyze New Image</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const uploadZone = container.querySelector('#wa-upload-zone');
        const fileInput = container.querySelector('#wa-file-input');
        const analysisState = container.querySelector('#wa-analysis-state');
        const results = container.querySelector('#wa-results');
        const confidenceFill = container.querySelector('#wa-confidence-fill');
        const progressBar = container.querySelector('#wa-progress-bar');
        const resetBtn = container.querySelector('#wa-reset-btn');

        // Drag & Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--primary)';
            uploadZone.style.backgroundColor = 'var(--bg-hover)';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.backgroundColor = 'var(--bg-surface)';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.backgroundColor = 'var(--bg-surface)';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                triggerAnalysis();
            }
        });

        uploadZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) triggerAnalysis();
        });

        const updateStage = (stageNum, status) => {
            const el = container.querySelector(`#stage-${stageNum}`);
            if (!el) return;
            const icon = el.querySelector('.stage-icon');
            
            if (status === 'active') {
                el.style.color = 'var(--primary)';
                el.style.fontWeight = '500';
                icon.style.borderColor = 'var(--primary)';
                icon.innerHTML = `<i data-lucide="loader" class="animate-pulse" style="width: 12px; height: 12px; color: var(--primary); display: block; margin: 2px;"></i>`;
            } else if (status === 'done') {
                el.style.color = 'var(--text-primary)';
                el.style.fontWeight = 'normal';
                icon.style.borderColor = 'var(--success)';
                icon.style.background = 'var(--success)';
                icon.innerHTML = `<i data-lucide="check" style="width: 12px; height: 12px; color: white; display: block; margin: 2px;"></i>`;
            } else {
                el.style.color = 'var(--text-tertiary)';
                el.style.fontWeight = 'normal';
                icon.style.borderColor = 'var(--border-color)';
                icon.style.background = 'transparent';
                icon.innerHTML = '';
            }
            if (window.lucide) window.lucide.createIcons();
        };

        const triggerAnalysis = () => {
            uploadZone.style.display = 'none';
            analysisState.style.display = 'block';
            progressBar.style.width = '0%';

            // Simulate Linear Pipeline
            updateStage(1, 'active');
            progressBar.style.width = '25%';
            
            setTimeout(() => { updateStage(1, 'done'); updateStage(2, 'active'); progressBar.style.width = '50%'; }, 1000);
            setTimeout(() => { updateStage(2, 'done'); updateStage(3, 'active'); progressBar.style.width = '75%'; }, 2200);
            setTimeout(() => { updateStage(3, 'done'); updateStage(4, 'active'); progressBar.style.width = '90%'; }, 3500);
            
            setTimeout(() => {
                updateStage(4, 'done');
                progressBar.style.width = '100%';
                appState.addTimelineEvent('Wound Assessment Completed', 'scan', 'primary');

                setTimeout(() => {
                    analysisState.style.display = 'none';
                    results.style.display = 'block';

                    setTimeout(() => {
                        confidenceFill.style.width = '87%';
                    }, 50);
                }, 600);

            }, 4800);
        };

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            uploadZone.style.display = 'block';
            analysisState.style.display = 'none';
            results.style.display = 'none';
            confidenceFill.style.width = '0%';
            progressBar.style.width = '0%';

            for(let i=1; i<=4; i++) updateStage(i, 'idle');
        });
    }, 0);

    return container;
}
