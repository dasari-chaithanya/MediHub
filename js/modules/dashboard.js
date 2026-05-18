/**
 * Dashboard Module (dashboard.js)
 */
import { appState, events } from '../state.js';

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
        <section class="hero-section" style="background: linear-gradient(135deg, var(--bg-surface), var(--bg-app)); padding: var(--space-4); margin-bottom: var(--space-4);">
            <div class="hero-bg-glow"></div>
            <div class="hero-content">
                <h1 style="font-size: 28px; margin-bottom: 8px;">${greeting}, ${user?.name || 'User'}</h1>
                <p class="hero-subtitle" style="font-size: 15px; margin-bottom: 20px;">${subGreeting}</p>
                <div class="hero-actions" style="gap: 12px;">
                    <button onclick="document.getElementById('add-reminder-modal').style.display='flex'" class="btn btn-primary" style="padding: 10px 20px; font-size: 14px;"><i data-lucide="plus" style="width: 16px;"></i> Add Reminder</button>
                    <a href="#/wound-analyzer" class="btn btn-outline" style="padding: 10px 20px; font-size: 14px;"><i data-lucide="scan" style="width: 16px;"></i> Analyze Wound</a>
                </div>
            </div>
            <div class="hero-metric animate-pulse" style="animation-duration: 4s; cursor: pointer;" id="db-health-score-card">
                <div class="card-metric" style="padding: var(--space-3); border-radius: var(--radius-lg); transition: all var(--duration-fast);">
                    <div class="metric-icon" style="color: var(--primary); background: rgba(20,184,166,0.1); padding: 12px; border-radius: 50%; margin-right: var(--space-2);"><i data-lucide="activity"></i></div>
                    <div class="metric-data">
                        <div style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px;">Health Score</div>
                        <div style="font-size: 32px; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--text-primary);" id="db-score-val">${user?.healthScore || 0}</div>
                        <div style="font-size: 12px; color: var(--success);"><i data-lucide="trending-up" style="width:12px;height:12px;vertical-align:middle;"></i> Click for breakdown</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 2: Quick Actions -->
        <section class="quick-actions-grid animate-fade-in stagger-2" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-top: var(--space-4); margin-bottom: var(--space-4);">
            <a href="#/medidex" class="card-action primary-action-card" style="border: 2px solid var(--primary); background: linear-gradient(145deg, var(--bg-surface), rgba(20, 184, 166, 0.05)); transform: scale(1.02); z-index: 1;">
                <div class="action-icon-wrap" style="color: var(--primary); background: rgba(20, 184, 166, 0.2);"><i data-lucide="pill"></i></div>
                <h3 style="font-size: 16px; margin: 0;">MediDex <span class="badge" style="background: var(--primary); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle;">PRO</span></h3>
                <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">Clinical reference</p>
            </a>
            <a href="#/reminders" class="card-action">
                <div class="action-icon-wrap" style="color: var(--warning); background: rgba(245, 158, 11, 0.1);"><i data-lucide="bell"></i></div>
                <h3 style="font-size: 16px; margin: 0;">Reminders</h3>
                <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">Manage schedule</p>
            </a>
            <a href="#/symptoms" class="card-action">
                <div class="action-icon-wrap" style="color: #a855f7; background: rgba(168, 85, 247, 0.1);"><i data-lucide="stethoscope"></i></div>
                <h3 style="font-size: 16px;">Symptoms</h3>
                <p style="font-size: 13px;">Analyze what you feel</p>
            </a>
            <a href="#/wound-analyzer" class="card-action" style="border-color: var(--primary); background: linear-gradient(to bottom right, var(--bg-surface), rgba(20,184,166,0.05));">
                <div class="action-icon-wrap" style="color: var(--primary); background: rgba(20,184,166,0.2);"><i data-lucide="scan-line"></i></div>
                <h3 style="font-size: 16px;">Wound Analyzer</h3>
                <p style="font-size: 13px;">AI Assessment</p>
            </a>
        </section>

        <!-- Section 3 & 4: Timeline & Reminders (Split View) -->
        <section class="bento-grid animate-fade-in stagger-3" style="grid-template-columns: 1fr 1fr;">
            
            <!-- LEFT: Today's Reminders -->
            <div class="card-surface" style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                    <h3 style="margin: 0;">Today's Reminders</h3>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button class="icon-btn" onclick="document.getElementById('add-reminder-modal').style.display='flex'" style="width: 28px; height: 28px; color: var(--primary); background: rgba(20,184,166,0.1);" title="Add Reminder"><i data-lucide="plus" style="width: 14px;"></i></button>
                        <a href="#/reminders" style="font-size: 13px; color: var(--text-tertiary); font-weight: 500;">View All</a>
                    </div>
                </div>
                
                <div style="flex: 1;">
                    ${pendingReminders.length === 0 ? `
                        <div class="empty-state" style="padding: var(--space-4) 0; text-align: center; color: var(--text-secondary);">
                            <div style="background: var(--bg-hover); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                                <i data-lucide="${state.reminders.length === 0 ? 'calendar-plus' : 'check-circle'}" class="empty-icon" style="color: var(--text-tertiary);"></i>
                            </div>
                            <p style="font-size: 14px; font-weight: 500; margin: 0 0 4px 0; color: var(--text-primary);">${state.reminders.length === 0 ? 'Start by setting your first health reminder.' : 'Your schedule is clear today.'}</p>
                            ${state.reminders.length === 0 ? `<button onclick="document.getElementById('add-reminder-modal').style.display='flex'" class="btn btn-primary mt-3" style="font-size: 13px; padding: 6px 16px;">Create Reminder</button>` : ''}
                        </div>
                    ` : `
                        <div class="reminder-list">
                            ${pendingReminders.slice(0, 4).map(r => `
                                <div class="card-info" style="border-left: 3px solid var(--primary); border-radius: 0 8px 8px 0; background: var(--bg-hover);">
                                    <i data-lucide="clock" style="color: var(--warning); width: 16px; height: 16px; margin-top: 2px;"></i>
                                    <div>
                                        <div style="font-weight: 600; font-size: 14px;">${r.title}</div>
                                        <div style="font-size: 12px; color: var(--text-tertiary);">${r.time}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
            
            <!-- RIGHT: Health Timeline -->
            <div class="card-surface" style="display: flex; flex-direction: column;">
                <h3 class="mb-3">Health Timeline</h3>
                <div style="flex: 1; overflow-y: auto; padding-right: 8px;" id="db-timeline">
                    <!-- Skeleton Loader for Timeline -->
                    <div id="timeline-skeleton" style="display: flex; flex-direction: column; gap: 16px; position: relative;">
                        <div style="display: flex; gap: 16px; position: relative;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-hover); flex-shrink: 0; animation: pulse-subtle 1.5s infinite;"></div>
                            <div style="background: var(--bg-hover); height: 32px; border-radius: 8px; flex: 1; animation: pulse-subtle 1.5s infinite 0.2s;"></div>
                        </div>
                        <div style="display: flex; gap: 16px; position: relative;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-hover); flex-shrink: 0; animation: pulse-subtle 1.5s infinite;"></div>
                            <div style="background: var(--bg-hover); height: 32px; border-radius: 8px; flex: 1; animation: pulse-subtle 1.5s infinite 0.4s;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Health Score Slide Panel (Hidden initially) -->
        <div id="db-score-panel" style="position: fixed; top: 0; right: -450px; width: 450px; height: 100vh; background: var(--bg-surface); z-index: var(--z-modal); box-shadow: var(--shadow-lg); transition: right var(--duration-normal) var(--ease-premium); border-left: 1px solid var(--border-color); display: flex; flex-direction: column;">
            <div style="padding: var(--space-4); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover);">
                <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 8px;"><i data-lucide="activity" style="color: var(--primary);"></i> Health Score</h2>
                <button class="icon-btn" id="db-score-close"><i data-lucide="x"></i></button>
            </div>
            
            <div style="flex: 1; overflow-y: auto; padding: var(--space-4);">
                <div style="text-align: center; margin-bottom: var(--space-4);">
                    <div style="font-size: 64px; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--primary); line-height: 1;">${user?.healthScore || 0}</div>
                    <div style="font-size: 14px; color: var(--success); font-weight: 500; margin-bottom: 8px;">Excellent Status</div>
                    <div style="font-size: 11px; color: var(--text-tertiary); background: var(--bg-hover); display: inline-block; padding: 4px 12px; border-radius: var(--radius-full);">Based on reminders, hydration, and sleep consistency</div>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                            <span style="font-weight: 500;"><i data-lucide="bell" style="width: 14px; vertical-align: bottom; margin-right: 4px;"></i> Adherence</span>
                            <strong>95%</strong>
                        </div>
                        <div style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 95%; background: var(--success);"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                            <span style="font-weight: 500;"><i data-lucide="moon" style="width: 14px; vertical-align: bottom; margin-right: 4px;"></i> Sleep Consistency</span>
                            <strong>7.2h Avg</strong>
                        </div>
                        <div style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 80%; background: var(--primary);"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                            <span style="font-weight: 500;"><i data-lucide="droplet" style="width: 14px; vertical-align: bottom; margin-right: 4px;"></i> Hydration</span>
                            <strong>Needs Work</strong>
                        </div>
                        <div style="height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 40%; background: var(--warning);"></div>
                        </div>
                    </div>
                </div>

                <div class="card-info mt-4" style="background: rgba(20, 184, 166, 0.05); border: 1px solid rgba(20, 184, 166, 0.2);">
                    <i data-lucide="lightbulb" style="color: var(--primary);"></i>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);"><strong>Improvement Insight:</strong> Increasing your daily hydration by 0.5L can boost your overall score by up to 5 points this week.</p>
                </div>
            </div>
        </div>
        <div id="db-backdrop" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: calc(var(--z-modal) - 1); opacity: 0; pointer-events: none; transition: opacity var(--duration-normal);"></div>
    `;

    setTimeout(() => {
        const scoreCard = container.querySelector('#db-health-score-card');
        const scorePanel = container.querySelector('#db-score-panel');
        const backdrop = container.querySelector('#db-backdrop');
        const closeBtn = container.querySelector('#db-score-close');

        // Health Score Hover Effect (Microinteraction)
        scoreCard.addEventListener('mouseenter', () => {
            scoreCard.style.transform = 'translateY(-3px)';
            scoreCard.style.boxShadow = 'var(--shadow-md)';
        });
        scoreCard.addEventListener('mouseleave', () => {
            scoreCard.style.transform = 'translateY(0)';
            scoreCard.style.boxShadow = 'none';
        });

        const openPanel = () => {
            scorePanel.style.right = '0';
            backdrop.style.opacity = '1';
            backdrop.style.pointerEvents = 'all';
        };

        const closePanel = () => {
            scorePanel.style.right = '-450px';
            backdrop.style.opacity = '0';
            backdrop.style.pointerEvents = 'none';
        };

        scoreCard.addEventListener('click', openPanel);
        closeBtn.addEventListener('click', closePanel);
        backdrop.addEventListener('click', closePanel);

        // Update score dynamically from event bus
        const scoreValEl = container.querySelector('#db-score-val');
        events.on('HEALTH_SCORE_UPDATED', (newScore) => {
            if (scoreValEl) scoreValEl.textContent = newScore;
            // update panel text too if needed
            const panelScore = scorePanel.querySelector('div[style*="font-size: 64px;"]');
            if(panelScore) panelScore.textContent = newScore;
        });

        // Simulate Timeline Loading
        setTimeout(() => {
            const timelineContainer = container.querySelector('#db-timeline');
            if (timelineContainer && state.timeline.length >= 0) {
                if (state.timeline.length === 0) {
                    timelineContainer.innerHTML = `
                        <div class="empty-state" style="padding: var(--space-4) 0; text-align: center; color: var(--text-secondary);">
                            <div style="background: var(--bg-hover); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                                <i data-lucide="activity" class="empty-icon" style="color: var(--text-tertiary);"></i>
                            </div>
                            <p style="font-size: 14px; font-weight: 500; margin: 0 0 4px 0; color: var(--text-primary);">Your timeline is empty.</p>
                            <span style="font-size: 12px; color: var(--text-tertiary);">Activities and events will appear here.</span>
                        </div>
                    `;
                } else {
                    timelineContainer.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 16px; position: relative;">
                            <div style="position: absolute; left: 15px; top: 10px; bottom: 10px; width: 2px; background: var(--border-color); z-index: 0;"></div>
                            ${state.timeline.slice(0, 5).map(event => {
                                const timeStr = new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                return `
                                    <div style="display: flex; gap: 16px; position: relative; z-index: 1; animation: slideUp 0.3s var(--ease-premium);">
                                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface); border: 2px solid var(--${event.type || 'primary'}); display: flex; align-items: center; justify-content: center; color: var(--${event.type || 'primary'}); flex-shrink: 0;">
                                            <i data-lucide="${event.icon}" style="width: 14px; height: 14px;"></i>
                                        </div>
                                        <div style="background: var(--bg-hover); padding: 8px 12px; border-radius: 8px; flex: 1; display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-size: 13px; font-weight: 500;">${event.message}</span>
                                            <span style="font-size: 11px; color: var(--text-tertiary);">${timeStr}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
                if (window.lucide) window.lucide.createIcons();
            }
        }, 800); // 800ms skeleton delay

    }, 0);

    return container;
}
