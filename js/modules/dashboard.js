/**
 * Dashboard Module (dashboard.js)
 */
import { appState, events } from '../state.js';
import { createProgressRingHTML, createEmptyStateHTML } from '../components/ui.js';

export async function render() {
    const state = appState.getState();
    const user = state.user;
    
    // 1. Context-Aware Insights Logic
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';

    // Generate intelligent sub-greeting based on data
    let subGreeting = '';
    const pendingReminders = state.reminders.filter(r => r.status === 'pending');
    if (pendingReminders.length > 0) {
        subGreeting = `You have ${pendingReminders.length} reminders pending today. Staying consistent is key.`;
    } else if (state.reminders.length > 0) {
        subGreeting = `Great job! All reminders completed for today.`;
    } else {
        subGreeting = `Start by setting your first medication reminder to build a healthy routine.`;
    }

    const container = document.createElement('div');
    container.className = 'dashboard-grid animate-fade-in stagger-1';
    container.style.position = 'relative';

    container.innerHTML = `
        <!-- Section 1: Hero -->
        <section class="hero-section card-surface" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); margin-bottom: var(--space-4); background: var(--bg-surface);">
            <div class="hero-content">
                <h1 style="font-size: 28px; margin-bottom: 8px; color: var(--text-primary);">${greeting}, ${user?.name || 'User'}</h1>
                <p class="hero-subtitle" style="font-size: 15px; margin-bottom: 20px; color: var(--text-secondary);">${subGreeting}</p>
                <div class="hero-actions" style="display: flex; gap: 12px;">
                    <button onclick="document.getElementById('add-reminder-modal').style.display='flex'" class="btn btn-primary" style="padding: 8px 16px; font-size: 14px;"><i data-lucide="plus" style="width: 16px;"></i> Add Reminder</button>
                    <a href="#/wound-analyzer" class="btn btn-outline" style="padding: 8px 16px; font-size: 14px;"><i data-lucide="scan" style="width: 16px;"></i> Analyze Wound</a>
                </div>
            </div>
            
            <div class="hero-metric" id="db-health-score-card" style="cursor: pointer; display: flex; align-items: center; gap: 16px; background: var(--bg-hover); padding: 16px 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); transition: border-color var(--duration-fast);">
                <div id="db-score-ring">
                    ${createProgressRingHTML(40, user?.healthScore || 0, `<span style="font-size: 20px; font-weight: 700; color: var(--text-primary);" id="db-score-val">${user?.healthScore || 0}</span>`)}
                </div>
                <div>
                    <div style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Health Score</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;"><i data-lucide="bar-chart-2" style="width:12px;height:12px;vertical-align:middle; color: var(--primary);"></i> View breakdown</div>
                </div>
            </div>
        </section>

        <!-- Section 2: Quick Actions -->
        <section class="quick-actions-grid animate-fade-in stagger-2" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-bottom: var(--space-4);">
            <a href="#/medidex" class="card-surface" style="display: flex; flex-direction: column; align-items: flex-start; transition: transform var(--duration-fast); text-decoration: none;">
                <div style="color: var(--primary); background: rgba(20, 184, 166, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 12px;"><i data-lucide="pill"></i></div>
                <h3 style="font-size: 15px; margin: 0 0 4px 0; color: var(--text-primary); font-weight: 600;">MediDex <span class="badge" style="background: var(--primary); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle;">PRO</span></h3>
                <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">Clinical reference</p>
            </a>
            <a href="#/reminders" class="card-surface" style="display: flex; flex-direction: column; align-items: flex-start; transition: transform var(--duration-fast); text-decoration: none;">
                <div style="color: var(--text-primary); background: var(--bg-hover); padding: 10px; border-radius: 8px; margin-bottom: 12px;"><i data-lucide="bell"></i></div>
                <h3 style="font-size: 15px; margin: 0 0 4px 0; color: var(--text-primary); font-weight: 600;">Reminders</h3>
                <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">Manage schedule</p>
            </a>
            <a href="#/symptoms" class="card-surface" style="display: flex; flex-direction: column; align-items: flex-start; transition: transform var(--duration-fast); text-decoration: none;">
                <div style="color: var(--text-primary); background: var(--bg-hover); padding: 10px; border-radius: 8px; margin-bottom: 12px;"><i data-lucide="stethoscope"></i></div>
                <h3 style="font-size: 15px; margin: 0 0 4px 0; color: var(--text-primary); font-weight: 600;">Symptoms</h3>
                <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">Analyze what you feel</p>
            </a>
            <a href="#/wound-analyzer" class="card-surface" style="display: flex; flex-direction: column; align-items: flex-start; transition: transform var(--duration-fast); text-decoration: none; border: 1px solid var(--primary);">
                <div style="color: var(--primary); background: rgba(20, 184, 166, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 12px;"><i data-lucide="scan-line"></i></div>
                <h3 style="font-size: 15px; margin: 0 0 4px 0; color: var(--text-primary); font-weight: 600;">Wound Analyzer</h3>
                <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">AI Assessment</p>
            </a>
        </section>

        <!-- Section 3: Health Trends Chart -->
        <section class="card-surface animate-fade-in stagger-3" style="margin-bottom: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                <h3 style="margin: 0; font-size: 16px;">Health Trends</h3>
                <select class="search-bar" style="padding: 4px 12px; font-size: 12px; width: auto;">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>
            <div style="height: 240px; width: 100%; position: relative;">
                <div id="chart-skeleton" style="position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 4px; padding-bottom: 20px;">
                    ${Array(7).fill().map((_, i) => `<div class="skeleton-box" style="flex: 1; height: ${Math.random() * 60 + 20}%; border-radius: 4px 4px 0 0;"></div>`).join('')}
                </div>
                <canvas id="healthTrendChart" style="display: none;"></canvas>
            </div>
        </section>

        <!-- Section 4: Timeline & Reminders (Split View) -->
        <section class="bento-grid animate-fade-in stagger-4" style="grid-template-columns: 1fr 1fr;">
            
            <!-- LEFT: Today's Reminders -->
            <div class="card-surface" style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                    <h3 style="margin: 0; font-size: 16px;">Today's Reminders</h3>
                    <a href="#/reminders" style="font-size: 13px; color: var(--primary); font-weight: 500; text-decoration: none;">View All</a>
                </div>
                
                <div style="flex: 1;">
                    ${pendingReminders.length === 0 ? 
                        createEmptyStateHTML(state.reminders.length === 0 ? 'calendar-plus' : 'check-circle', state.reminders.length === 0 ? 'No Reminders Set' : 'All Clear!', state.reminders.length === 0 ? 'Start by setting your first health reminder.' : 'Your schedule is clear today.', state.reminders.length === 0 ? `<button onclick="document.getElementById('add-reminder-modal').style.display='flex'" class="btn btn-outline">Create Reminder</button>` : '')
                    : `
                        <div class="reminder-list" style="display: flex; flex-direction: column; gap: 8px;">
                            ${pendingReminders.slice(0, 4).map(r => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface);">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--warning);"></div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 500; font-size: 14px; color: var(--text-primary);">${r.title}</div>
                                        <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px;">${r.time}</div>
                                    </div>
                                    <button class="icon-btn" style="color: var(--text-tertiary);"><i data-lucide="check" style="width: 16px;"></i></button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
            
            <!-- RIGHT: Health Timeline -->
            <div class="card-surface" style="display: flex; flex-direction: column;">
                <h3 style="margin: 0 0 var(--space-3) 0; font-size: 16px;">Activity Timeline</h3>
                <div style="flex: 1; overflow-y: auto; padding-right: 8px;" id="db-timeline">
                    <!-- Skeleton Loader for Timeline -->
                    <div id="timeline-skeleton" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; gap: 16px;">
                            <div class="skeleton-box" style="width: 12px; height: 12px; border-radius: 50%; margin-top: 4px;"></div>
                            <div style="flex: 1;">
                                <div class="skeleton-text" style="width: 80%;"></div>
                                <div class="skeleton-text" style="width: 40%; height: 12px;"></div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <div class="skeleton-box" style="width: 12px; height: 12px; border-radius: 50%; margin-top: 4px;"></div>
                            <div style="flex: 1;">
                                <div class="skeleton-text" style="width: 60%;"></div>
                                <div class="skeleton-text" style="width: 30%; height: 12px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Health Score Slide Panel (Hidden initially) -->
        <div id="db-score-panel" style="position: fixed; top: 0; right: -450px; width: min(450px, 90vw); height: 100vh; background: var(--bg-surface); z-index: var(--z-modal); box-shadow: -10px 0 30px rgba(0,0,0,0.05); transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1); border-left: 1px solid var(--border-color); display: flex; flex-direction: column;">
            <div style="padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Health Score Breakdown</h2>
                <button class="icon-btn" id="db-score-close" style="border: 1px solid var(--border-color);"><i data-lucide="x"></i></button>
            </div>
            
            <div style="flex: 1; overflow-y: auto; padding: 24px;">
                <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 32px;">
                    ${createProgressRingHTML(60, user?.healthScore || 0, `<span style="font-size: 32px; font-weight: 700; color: var(--text-primary); line-height: 1;">${user?.healthScore || 0}</span>`)}
                    <div style="font-size: 14px; color: var(--text-secondary); margin-top: 16px; text-align: center;">Based on adherence, hydration, and sleep.</div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                            <span style="font-weight: 500; color: var(--text-primary);">Medication Adherence</span>
                            <strong style="color: var(--text-primary);">95%</strong>
                        </div>
                        <div style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 95%; background: var(--primary);"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                            <span style="font-weight: 500; color: var(--text-primary);">Sleep Consistency</span>
                            <strong style="color: var(--text-primary);">7.2h Avg</strong>
                        </div>
                        <div style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 80%; background: var(--primary);"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="db-backdrop" style="position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(2px); z-index: calc(var(--z-modal) - 1); opacity: 0; pointer-events: none; transition: opacity var(--duration-normal);"></div>
    `;

    setTimeout(async () => {
        const scoreCard = container.querySelector('#db-health-score-card');
        const scorePanel = container.querySelector('#db-score-panel');
        const backdrop = container.querySelector('#db-backdrop');
        const closeBtn = container.querySelector('#db-score-close');

        // Clean Hover state for score card
        scoreCard.addEventListener('mouseenter', () => { scoreCard.style.borderColor = 'var(--primary)'; });
        scoreCard.addEventListener('mouseleave', () => { scoreCard.style.borderColor = 'var(--border-color)'; });

        const openPanel = () => {
            scorePanel.style.right = '0';
            backdrop.style.opacity = '1';
            backdrop.style.pointerEvents = 'all';
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const closePanel = () => {
            scorePanel.style.right = '-450px';
            backdrop.style.opacity = '0';
            backdrop.style.pointerEvents = 'none';
            document.body.style.overflow = '';
        };

        scoreCard.addEventListener('click', openPanel);
        closeBtn.addEventListener('click', closePanel);
        backdrop.addEventListener('click', closePanel);

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape' && backdrop.style.opacity === '1') closePanel();
        });

        // Initialize Chart.js
        try {
            const module = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm');
            const Chart = module.Chart;
            const registerables = module.registerables;
            Chart.register(...registerables);

            const ctx = container.querySelector('#healthTrendChart').getContext('2d');
            const skeleton = container.querySelector('#chart-skeleton');
            const canvas = container.querySelector('#healthTrendChart');
            
            skeleton.style.display = 'none';
            canvas.style.display = 'block';

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Health Score',
                        data: [78, 80, 85, 82, 88, 92, user?.healthScore || 95],
                        borderColor: '#14b8a6', // primary color
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4, // Smooth curve
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#14b8a6',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 13, family: 'Inter' },
                        bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
                        displayColors: false,
                        cornerRadius: 8
                    } },
                    scales: {
                        y: { display: false, min: 60, max: 100 },
                        x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8' } }
                    },
                    interaction: { mode: 'index', intersect: false }
                }
            });
        } catch (err) {
            console.error("Failed to load Chart.js", err);
        }

        // Simulate Timeline Loading
        setTimeout(() => {
            const timelineContainer = container.querySelector('#db-timeline');
            if (timelineContainer && state.timeline) {
                if (state.timeline.length === 0) {
                    timelineContainer.innerHTML = createEmptyStateHTML('activity', 'Empty Timeline', 'Your activities and events will appear here.');
                } else {
                    timelineContainer.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 20px; position: relative;">
                            <div style="position: absolute; left: 5px; top: 10px; bottom: 10px; width: 2px; background: var(--bg-hover); z-index: 0;"></div>
                            ${state.timeline.slice(0, 5).map(event => {
                                const timeStr = new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                return `
                                    <div style="display: flex; gap: 16px; position: relative; z-index: 1;">
                                        <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--primary); outline: 4px solid var(--bg-surface); margin-top: 4px; flex-shrink: 0;"></div>
                                        <div style="flex: 1; padding-bottom: 4px;">
                                            <div style="font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px;">${event.message}</div>
                                            <div style="font-size: 12px; color: var(--text-tertiary);">${timeStr}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
                if (window.lucide) window.lucide.createIcons();
            }
        }, 600); // skeleton delay

        if (window.lucide) window.lucide.createIcons();
    }, 0);

    return container;
}
