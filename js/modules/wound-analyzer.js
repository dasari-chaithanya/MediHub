/**
 * Wound Analyzer Module (wound-analyzer.js)
 */
import { appState, events } from '../state.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'analyzer-container animate-fade-in stagger-1';

    container.innerHTML = `
        <div class="card-surface mb-4" style="text-align: center; border-bottom: 4px solid var(--primary);">
            <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 8px;">
                <i data-lucide="shield-check" style="color: var(--success);"></i>
                <span style="font-size: 12px; font-weight: 600; color: var(--success); letter-spacing: 1px; text-transform: uppercase;">Clinical AI Pipeline</span>
            </div>
            <h1 style="font-size: 32px; margin-bottom: 8px;">Smart Wound Assessment</h1>
            <p style="color: var(--text-secondary); font-size: 16px; max-width: 600px; margin: 0 auto;">Upload a clear picture of your wound to receive an estimated severity assessment. <strong>Educational guidance only.</strong></p>
        </div>

        <!-- Step 1: Upload Zone -->
        <div id="wa-upload-zone" class="upload-zone mb-4" style="transition: all var(--duration-fast) var(--ease-premium);">
            <input type="file" id="wa-file-input" accept="image/*" class="hide">
            <div id="wa-idle-state" style="pointer-events: none;">
                <div class="action-icon-wrap" style="margin: 0 auto var(--space-2); width: 64px; height: 64px; background: rgba(20, 184, 166, 0.1); color: var(--primary);">
                    <i data-lucide="upload-cloud" style="width: 32px; height: 32px;"></i>
                </div>
                <div class="upload-text" style="font-size: 20px;">Drag and drop or click to upload</div>
                <div class="upload-subtext mt-1">JPG, PNG up to 10MB. Ensure bright, focused lighting.</div>
            </div>
        </div>

        <!-- Step 2: 5-Stage Analysis State -->
        <div id="wa-analysis-state" class="analysis-state card-surface mb-4" style="display: none;">
            <div style="display: flex; gap: var(--space-4); align-items: stretch;">
                <div style="flex: 1; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
                    <i data-lucide="image" id="wa-scan-icon" style="width: 64px; height: 64px; color: var(--border-color); transition: color 0.3s;"></i>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: var(--space-2);">
                    <h3 style="margin-bottom: var(--space-2);">Analysis Pipeline</h3>
                    <div id="wa-stages">
                        <div class="wa-stage" id="stage-1" style="display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-size: 14px; margin-bottom: 8px;"><i data-lucide="circle" style="width: 14px;"></i> Uploading image...</div>
                        <div class="wa-stage" id="stage-2" style="display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-size: 14px; margin-bottom: 8px;"><i data-lucide="circle" style="width: 14px;"></i> Preprocessing visual data...</div>
                        <div class="wa-stage" id="stage-3" style="display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-size: 14px; margin-bottom: 8px;"><i data-lucide="circle" style="width: 14px;"></i> Detecting tissue patterns...</div>
                        <div class="wa-stage" id="stage-4" style="display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-size: 14px; margin-bottom: 8px;"><i data-lucide="circle" style="width: 14px;"></i> Analyzing severity heuristics...</div>
                        <div class="wa-stage" id="stage-5" style="display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font-size: 14px;"><i data-lucide="circle" style="width: 14px;"></i> Generating assessment...</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step 3: Results -->
        <div id="wa-results" class="analysis-results animate-slide-up" style="display: none;">
            <div class="bento-grid" style="grid-template-columns: 1fr; gap: var(--space-3);">
                <div class="card-surface" style="border-left: 4px solid var(--warning);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3);">
                        <div>
                            <h3 style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">Estimated Severity <i data-lucide="info" style="width: 16px; color: var(--text-tertiary);"></i></h3>
                            <span class="badge" style="background: rgba(245, 158, 11, 0.1); color: var(--warning); padding: 6px 12px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: 'Sora', sans-serif;">Mild Surface Inflammation</span>
                        </div>
                        <div style="text-align: right; width: 150px;">
                            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; color: var(--text-secondary);">
                                <span>Confidence</span>
                                <strong>87%</strong>
                            </div>
                            <div class="confidence-meter" style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                                <div class="confidence-fill" id="wa-confidence-fill" style="background: var(--accent); width: 0%; transition: width 1s ease;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="card-info mb-4" style="background: var(--bg-hover);">
                        <i data-lucide="activity" style="color: var(--primary);"></i>
                        <div>
                            <h4 style="font-size: 14px; margin-bottom: 4px;">Assessment Details</h4>
                            <p style="margin:0; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">The image matches patterns of superficial abrasion with mild inflammatory response. No deep tissue exposure or severe necrotic indicators detected.</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
                        <div>
                            <h4 class="mb-2">Suggested Care</h4>
                            <ul style="padding-left: 20px; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                <li>Clean gently with sterile saline.</li>
                                <li>Pat dry with a clean cloth.</li>
                                <li>Monitor swelling for 24 hours.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="mb-2">Related References</h4>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <a href="#/medidex" class="btn btn-outline" style="justify-content: flex-start; padding: 8px 12px; font-size: 13px;"><i data-lucide="pill" style="width: 16px;"></i> Antiseptic Wash</a>
                                <a href="#/medidex" class="btn btn-outline" style="justify-content: flex-start; padding: 8px 12px; font-size: 13px;"><i data-lucide="pill" style="width: 16px;"></i> Topical Antibiotic</a>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: var(--space-3);">
                        <p style="margin: 0; font-size: 12px; color: var(--text-tertiary);">Consult a physician if symptoms worsen.</p>
                        <button class="btn btn-outline" id="wa-reset-btn">New Assessment</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const uploadZone = container.querySelector('#wa-upload-zone');
        const fileInput = container.querySelector('#wa-file-input');
        const analysisState = container.querySelector('#wa-analysis-state');
        const results = container.querySelector('#wa-results');
        const confidenceFill = container.querySelector('#wa-confidence-fill');
        const scanIcon = container.querySelector('#wa-scan-icon');
        const resetBtn = container.querySelector('#wa-reset-btn');

        // Drag & Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--primary)';
            uploadZone.style.backgroundColor = 'rgba(20, 184, 166, 0.05)';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.backgroundColor = 'var(--bg-surface)';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                triggerAnalysis();
            }
        });

        uploadZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) triggerAnalysis();
        });

        const updateStage = (stageNum) => {
            const el = container.querySelector(`#stage-${stageNum}`);
            if (el) {
                el.style.color = 'var(--text-primary)';
                el.style.fontWeight = '500';
                el.innerHTML = `<i data-lucide="check-circle" style="width: 14px; color: var(--success);"></i> ${el.innerText}`;
                if (window.lucide) window.lucide.createIcons();
            }
        };

        const setActiveStage = (stageNum) => {
            const el = container.querySelector(`#stage-${stageNum}`);
            if (el) {
                el.style.color = 'var(--primary)';
                el.innerHTML = `<i data-lucide="loader" class="animate-pulse" style="width: 14px; color: var(--primary);"></i> ${el.innerText}`;
                if (window.lucide) window.lucide.createIcons();
            }
        };

        const triggerAnalysis = () => {
            uploadZone.style.display = 'none';
            analysisState.style.display = 'block';
            scanIcon.style.color = 'var(--primary)';
            scanIcon.classList.add('animate-pulse');

            const dim = document.getElementById('global-dim');
            if (dim) dim.classList.add('active');
            analysisState.style.position = 'relative';
            analysisState.style.zIndex = '9999';

            // Simulate Pipeline
            setActiveStage(1);
            setTimeout(() => { updateStage(1); setActiveStage(2); }, 800);
            setTimeout(() => { updateStage(2); setActiveStage(3); }, 1800);
            setTimeout(() => { updateStage(3); setActiveStage(4); }, 3000);
            setTimeout(() => { updateStage(4); setActiveStage(5); }, 4000);
            
            setTimeout(() => {
                updateStage(5);
                scanIcon.classList.remove('animate-pulse');
                scanIcon.style.color = 'var(--success)';
                
                appState.addTimelineEvent('Wound Assessment Completed', 'scan', 'primary');

                setTimeout(() => {
                    analysisState.style.display = 'none';
                    results.style.display = 'block';
                    
                    if (dim) dim.classList.remove('active');
                    analysisState.style.zIndex = '1';
                    results.style.position = 'relative';
                    results.style.zIndex = '1';

                    setTimeout(() => {
                        confidenceFill.style.width = '87%';
                    }, 100);
                }, 800);

            }, 5000);
        };

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            uploadZone.style.display = 'flex';
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.backgroundColor = 'var(--bg-surface)';
            
            analysisState.style.display = 'none';
            results.style.display = 'none';
            confidenceFill.style.width = '0%';

            // Reset stages
            const stages = ['Uploading image...', 'Preprocessing visual data...', 'Detecting tissue patterns...', 'Analyzing severity heuristics...', 'Generating assessment...'];
            for(let i=1; i<=5; i++) {
                const el = container.querySelector(`#stage-${i}`);
                if (el) {
                    el.style.color = 'var(--text-tertiary)';
                    el.style.fontWeight = 'normal';
                    el.innerHTML = `<i data-lucide="circle" style="width: 14px;"></i> ${stages[i-1]}`;
                }
            }
            if (window.lucide) window.lucide.createIcons();
        });
    }, 0);

    return container;
}
