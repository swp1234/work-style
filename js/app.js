/* Work Style Test — App Logic */

// Each option index (0=A,1=B,2=C,3=D,4=E) maps to type (L,E,C,A,R) consistently
const TYPE_KEYS = ['L', 'E', 'C', 'A', 'R'];
const TOTAL_QUESTIONS = 25;

const TYPE_META = {
    L: { emoji: '👑', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icons: ['🎯','🏆','⚡'] },
    E: { emoji: '⚡', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icons: ['🚀','💪','✅'] },
    C: { emoji: '🎨', color: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', icons: ['💡','🌈','✨'] },
    A: { emoji: '🔬', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', icons: ['📊','🎯','🔍'] },
    R: { emoji: '🤝', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', icons: ['💛','🌟','🫂'] }
};

const CAREER_ICONS = ['💼', '🏢', '🌱'];

const state = {
    currentQ: 0,
    scores: { L: 0, E: 0, C: 0, A: 0, R: 0 },
    answers: [],
    primaryType: null,
    secondaryType: null
};

function resetState() {
    state.currentQ = 0;
    state.scores = { L: 0, E: 0, C: 0, A: 0, R: 0 };
    state.answers = [];
    state.primaryType = null;
    state.secondaryType = null;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
}

function renderQuestion() {
    const idx = state.currentQ;
    const qKey = `q${idx + 1}`;
    const qText = i18n.t(`questions.${qKey}`);
    const meta = i18n.getCurrentLanguage();

    document.getElementById('q-number').textContent = i18n.t('quiz.questionLabel').replace('{{n}}', idx + 1);
    document.getElementById('q-text').textContent = qText;
    document.getElementById('progress-text').textContent = `${idx + 1} / ${TOTAL_QUESTIONS}`;
    document.getElementById('progress-fill').style.width = `${((idx) / TOTAL_QUESTIONS) * 100}%`;

    const optionsEl = document.getElementById('q-options');
    optionsEl.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D', 'E'];
    TYPE_KEYS.forEach((typeKey, i) => {
        const optKey = `questions.${qKey}${letters[i].toLowerCase()}`;
        const optText = i18n.t(optKey);
        if (!optText || optText === optKey) return;

        const btn = document.createElement('button');
        btn.className = 'q-option';
        btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span>${optText}</span>`;
        btn.addEventListener('click', () => selectAnswer(i));
        optionsEl.appendChild(btn);
    });

    // Animate card
    const card = document.getElementById('question-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'slideIn 0.35s ease';
}

function selectAnswer(optionIdx) {
    const typeKey = TYPE_KEYS[optionIdx];
    state.scores[typeKey]++;
    state.answers.push(optionIdx);
    state.currentQ++;

    if (state.currentQ >= TOTAL_QUESTIONS) {
        showLoadingThenResult();
    } else {
        renderQuestion();
    }
}

function showLoadingThenResult() {
    showScreen('loading-screen');
    const fill = document.getElementById('loading-fill');
    const msgEl = document.getElementById('loading-msg');

    const loadingMsgs = [
        i18n.t('loading.msg1'),
        i18n.t('loading.msg2'),
        i18n.t('loading.msg3'),
        i18n.t('loading.msg4')
    ];

    let progress = 0;
    let msgIdx = 0;
    msgEl.textContent = loadingMsgs[0];

    const interval = setInterval(() => {
        progress += Math.random() * 15 + 8;
        if (progress >= 100) { progress = 100; clearInterval(interval); }
        fill.style.width = `${Math.min(progress, 100)}%`;

        const newMsgIdx = Math.floor((progress / 100) * (loadingMsgs.length - 1));
        if (newMsgIdx !== msgIdx && newMsgIdx < loadingMsgs.length) {
            msgIdx = newMsgIdx;
            msgEl.textContent = loadingMsgs[msgIdx];
        }

        if (progress >= 100) {
            setTimeout(() => {
                calculateResults();
                renderResult();
                showScreen('result-screen');
            }, 400);
        }
    }, 180);
}

function calculateResults() {
    const sorted = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
    state.primaryType = sorted[0][0];
    state.secondaryType = sorted[1][0];
}

function renderResult() {
    const container = document.getElementById('result-container');
    container.innerHTML = '';

    const pt = state.primaryType;
    const st = state.secondaryType;
    const meta = TYPE_META[pt];
    const typData = getTypeData(pt);
    const stData = getTypeData(st);
    const stMeta = TYPE_META[st];
    const maxScore = TOTAL_QUESTIONS;

    // 1. Result Header
    const header = document.createElement('div');
    header.className = 'result-header';
    header.innerHTML = `
        <span class="result-emoji-large">${meta.emoji}</span>
        <div class="result-type-badge" style="color:${meta.color};border-color:${meta.color}">
            ${meta.emoji} ${i18n.t('result.primaryLabel')}
        </div>
        <div class="result-title-text" style="color:${meta.color}">${typData.name}</div>
        <div class="result-en">${typData.enName}</div>
        <div class="result-subtitle-text">${typData.subtitle}</div>
    `;
    container.appendChild(header);

    // 2. Secondary Type
    const secDiv = document.createElement('div');
    secDiv.className = 'secondary-badge';
    secDiv.innerHTML = `<span>${stMeta.emoji}</span> ${i18n.t('result.secondaryLabel')}: <strong>${stData.name}</strong> (${stData.enName})`;
    container.appendChild(secDiv);

    // 3. Description
    const descCard = document.createElement('div');
    descCard.className = 'result-card';
    descCard.innerHTML = `<h3>📋 ${i18n.t('result.descTitle')}</h3><p class="result-desc">${typData.description}</p>`;
    container.appendChild(descCard);

    // 4. Score Spectrum
    const scoreCard = document.createElement('div');
    scoreCard.className = 'result-card';
    scoreCard.innerHTML = `<h3>📊 ${i18n.t('result.scoreTitle')}</h3><div class="score-bars" id="score-bars"></div>`;
    container.appendChild(scoreCard);

    setTimeout(() => {
        const barsEl = document.getElementById('score-bars');
        if (!barsEl) return;
        const typeOrder = [pt, st, ...TYPE_KEYS.filter(k => k !== pt && k !== st)];
        typeOrder.forEach(typeKey => {
            const score = state.scores[typeKey];
            const pct = Math.round((score / maxScore) * 100);
            const m = TYPE_META[typeKey];
            const td = getTypeData(typeKey);
            const row = document.createElement('div');
            row.className = 'score-row';
            row.innerHTML = `
                <div class="score-label" style="color:${m.color}">${m.emoji} ${td.name}</div>
                <div class="score-bar-wrap">
                    <div class="score-bar-fill" style="width:0%;background:${m.color}" data-target="${pct}"></div>
                </div>
                <div class="score-num">${score}</div>
            `;
            barsEl.appendChild(row);
        });
        requestAnimationFrame(() => {
            document.querySelectorAll('.score-bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.target + '%';
            });
        });
    }, 100);

    // 5. Strengths
    const strengthCard = document.createElement('div');
    strengthCard.className = 'result-card';
    const strengths = typData.strengths || [];
    strengthCard.innerHTML = `
        <h3>🚀 ${i18n.t('result.strengthsTitle')}</h3>
        <div class="strength-list">
            ${strengths.map((s, i) => `
                <div class="strength-item">
                    <span class="item-icon">${meta.icons[i] || '✅'}</span>
                    <span>${s}</span>
                </div>`).join('')}
        </div>`;
    container.appendChild(strengthCard);

    // 6. Weaknesses
    const weakCard = document.createElement('div');
    weakCard.className = 'result-card';
    const weaknesses = typData.weaknesses || [];
    weakCard.innerHTML = `
        <h3>💪 ${i18n.t('result.weaknessesTitle')}</h3>
        <div class="weakness-list">
            ${weaknesses.map(w => `
                <div class="weakness-item">
                    <span class="item-icon">🌱</span>
                    <span>${w}</span>
                </div>`).join('')}
        </div>`;
    container.appendChild(weakCard);

    // 7. Best Match
    const bestMatchKey = typData.bestMatch;
    const bmMeta = TYPE_META[bestMatchKey];
    const bmData = getTypeData(bestMatchKey);
    const bmCard = document.createElement('div');
    bmCard.className = 'result-card';
    bmCard.innerHTML = `
        <h3>🤝 ${i18n.t('result.bestMatchTitle')}</h3>
        <div class="best-match-card">
            <span class="match-emoji">${bmMeta.emoji}</span>
            <div>
                <div class="match-name" style="color:${bmMeta.color}">${bmData.name} (${bmData.enName})</div>
                <div class="match-reason">${typData.bestMatchReason}</div>
            </div>
        </div>`;
    container.appendChild(bmCard);

    // 8. Careers
    const careerCard = document.createElement('div');
    careerCard.className = 'result-card';
    const careers = typData.careers || [];
    careerCard.innerHTML = `
        <h3>💼 ${i18n.t('result.careersTitle')}</h3>
        <div class="careers-list">
            ${careers.map((c, i) => `
                <div class="career-item">
                    <span class="career-icon">${CAREER_ICONS[i] || '💼'}</span>
                    <span>${c}</span>
                </div>`).join('')}
        </div>`;
    container.appendChild(careerCard);

    // 9. Motivation
    const motivCard = document.createElement('div');
    motivCard.className = 'result-card';
    motivCard.innerHTML = `
        <h3>✨ ${i18n.t('result.motivationTitle')}</h3>
        <div class="motivation-text">${typData.motivation}</div>`;
    container.appendChild(motivCard);

    // 11. Related Tests
    const lang = i18n.getCurrentLanguage() || 'ko';
    const relatedDiv = document.createElement('div');
    relatedDiv.className = 'related-tests';
    relatedDiv.innerHTML = `
        <h3 data-i18n="result.moreTests">${i18n.t('result.moreTests')}</h3>
        <div class="related-grid">
            <a href="/stress-check/?lang=${encodeURIComponent(lang)}&source=work_style_result" class="related-card" style="--card-color:#3498db">
                <span class="related-emoji">💆</span>
                <span class="related-name" data-i18n="related.stressCheck">${i18n.t('related.stressCheck')}</span>
            </a>
            <a href="/future-self/?lang=${encodeURIComponent(lang)}&source=work_style_result" class="related-card" style="--card-color:#ff6b9d">
                <span class="related-emoji">⏳</span>
                <span class="related-name" data-i18n="related.futureSelf">${i18n.t('related.futureSelf')}</span>
            </a>
            <a href="/mbti-tips/?lang=${encodeURIComponent(lang)}&source=work_style_result" class="related-card" style="--card-color:#9b59b6">
                <span class="related-emoji">💡</span>
                <span class="related-name" data-i18n="related.mbtiTips">${i18n.t('related.mbtiTips')}</span>
            </a>
            <a href="/mbti-career/?lang=${encodeURIComponent(lang)}&source=work_style_result" class="related-card" style="--card-color:#10b981">
                <span class="related-emoji">💼</span>
                <span class="related-name" data-i18n="related.mbtiCareer">${i18n.t('related.mbtiCareer')}</span>
            </a>
        </div>
    `;
    relatedDiv.querySelectorAll('a.related-card').forEach(link => {
        link.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'content_cta_click', {
                    cta_surface: 'work_style_related',
                    destination: link.getAttribute('href'),
                    source: 'work_style_result',
                    lang: lang
                });
            }
        });
    });
    container.appendChild(relatedDiv);

    // 11.5 Curated Reading & Career Growth
    const stores = { de: 'www.amazon.de', fr: 'www.amazon.fr', es: 'www.amazon.es', ja: 'www.amazon.co.jp', ko: 'www.amazon.com' };
    const host = stores[lang] || 'www.amazon.com';
    const curatedCard = document.createElement('div');
    curatedCard.className = 'result-card curated-card';
    curatedCard.id = 'curated-resources-card';
    curatedCard.innerHTML = `
        <h3>📚 ${i18n.t('curated.title')}</h3>
        <p class="curated-subtitle">${i18n.t('curated.subtitle')}</p>
        <div class="curated-list">
            <a href="https://${host}/dp/0060833459?tag=dopabrain-20" target="_blank" rel="noopener noreferrer sponsored" class="curated-item" data-curated-key="effectiveExecutive">
                <div class="curated-item-meta">
                    <span class="curated-item-title">${i18n.t('curated.book1Title')}</span>
                    <span class="curated-item-desc">${i18n.t('curated.book1Desc')}</span>
                </div>
                <span class="curated-item-cta">${i18n.t('curated.cta')} →</span>
            </a>
            <a href="https://${host}/dp/0787960756?tag=dopabrain-20" target="_blank" rel="noopener noreferrer sponsored" class="curated-item" data-curated-key="fiveDysfunctions">
                <div class="curated-item-meta">
                    <span class="curated-item-title">${i18n.t('curated.book2Title')}</span>
                    <span class="curated-item-desc">${i18n.t('curated.book2Desc')}</span>
                </div>
                <span class="curated-item-cta">${i18n.t('curated.cta')} →</span>
            </a>
        </div>
        <p class="curated-disclosure">${i18n.t('curated.disclosure')}</p>
    `;
    curatedCard.querySelectorAll('.curated-item').forEach(link => {
        link.addEventListener('click', () => {
            const key = link.getAttribute('data-curated-key');
            if (typeof gtag === 'function') {
                gtag('event', 'curated_resource_click', {
                    app_name: 'work-style',
                    resource_key: key,
                    content_locale: lang,
                    cta_surface: 'curated_resources'
                });
                gtag('event', 'content_cta_click', {
                    cta_type: 'curated_book',
                    destination: link.getAttribute('href'),
                    source: 'work_style'
                });
            }
        });
    });
    container.appendChild(curatedCard);

    // 12. Share CTA
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'share-cta';
    ctaDiv.textContent = i18n.t('share.compareWith');
    container.appendChild(ctaDiv);

    // 13. Action Buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'action-buttons';
    actionsDiv.innerHTML = `
        <button class="btn-action btn-download" id="btn-download" data-i18n="share.downloadCard">${i18n.t('share.downloadCard')}</button>
        <button class="btn-action btn-share" id="btn-share" data-i18n="result.shareBtn">📤 결과 공유하기</button>
        <button class="btn-action btn-retry" id="btn-retry" data-i18n="result.retryBtn">🔄 다시 테스트하기</button>
    `;
    container.appendChild(actionsDiv);

    // Translate new elements
    i18n.updateUI();

    // Bind result buttons
    document.getElementById('btn-download')?.addEventListener('click', downloadStoryCard);
    document.getElementById('btn-share')?.addEventListener('click', openShareModal);
    document.getElementById('btn-retry')?.addEventListener('click', retryTest);

    // Track result (clean telemetry without raw score)
    if (typeof gtag !== 'undefined' && !renderResult._trackedThisRun) {
        renderResult._trackedThisRun = true;
        gtag('event', 'quiz_complete', { event_category: 'work_style', event_label: pt });
        gtag('event', 'test_complete', { app_name: 'work-style', result_type: pt });
    }
}

function getTypeData(key) {
    return {
        name: i18n.t(`types.${key}.name`),
        enName: i18n.t(`types.${key}.enName`),
        subtitle: i18n.t(`types.${key}.subtitle`),
        description: i18n.t(`types.${key}.description`),
        strengths: [
            i18n.t(`types.${key}.strength1`),
            i18n.t(`types.${key}.strength2`),
            i18n.t(`types.${key}.strength3`)
        ].filter(s => s && !s.startsWith('types.')),
        weaknesses: [
            i18n.t(`types.${key}.weakness1`),
            i18n.t(`types.${key}.weakness2`)
        ].filter(w => w && !w.startsWith('types.')),
        bestMatch: i18n.t(`types.${key}.bestMatch`),
        bestMatchReason: i18n.t(`types.${key}.bestMatchReason`),
        careers: [
            i18n.t(`types.${key}.career1`),
            i18n.t(`types.${key}.career2`),
            i18n.t(`types.${key}.career3`)
        ].filter(c => c && !c.startsWith('types.')),
        motivation: i18n.t(`types.${key}.motivation`)
    };
}

function openShareModal() {
    document.getElementById('share-modal').classList.remove('hidden');
}

function closeShareModal() {
    document.getElementById('share-modal').classList.add('hidden');
}

function retryTest() {
    resetState();
    showScreen('intro-screen');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function getShareUrl() {
    const lang = i18n.getCurrentLanguage() || 'ko';
    return `https://dopabrain.com/work-style/?lang=${encodeURIComponent(lang)}&utm_source=share`;
}

function buildShareText() {
    const pt = state.primaryType;
    const typData = getTypeData(pt);
    const meta = TYPE_META[pt];
    return `${meta.emoji} ${i18n.t('share.shareText').replace('{{type}}', typData.name).replace('{{enName}}', typData.enName)}\n\n${getShareUrl()}`;
}

function downloadStoryCard() {
    const pt = state.primaryType;
    if (!pt) return;
    const typData = getTypeData(pt);
    const meta = TYPE_META[pt];
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#0f0f1a');
    grad.addColorStop(0.55, '#1e1b4b');
    grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.16)';
    ctx.beginPath();
    ctx.arc(540, 560, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DOPABRAIN · WORK STYLE PROFILE', 540, 210);

    ctx.font = '180px sans-serif';
    ctx.fillText(meta.emoji, 540, 610);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 62px sans-serif';
    ctx.fillText(`${typData.name} (${typData.enName})`, 540, 800);

    ctx.fillStyle = meta.color || '#818cf8';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(typData.subtitle || '', 540, 880);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '32px sans-serif';
    const words = (typData.description || '').split(' ');
    let line = '', y = 990;
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > 860 && line) {
            ctx.fillText(line, 540, y);
            line = word;
            y += 48;
            if (y > 1520) break;
        } else {
            line = test;
        }
    }
    if (line && y <= 1560) ctx.fillText(line, 540, y);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('dopabrain.com/work-style/', 540, 1760);

    try {
        const link = document.createElement('a');
        link.download = `work-style-${pt.toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (e) {}

    if (typeof gtag === 'function') {
        gtag('event', 'save_image', {
            app_name: 'work-style',
            result_type: pt,
            save_surface: 'result_story_1080x1920'
        });
    }
}

// ==================== INIT ====================
(async () => {
    try {
        await i18n.setLanguage(i18n.currentLang);
    } catch (e) {
        console.warn('i18n init failed:', e);
    }

    // Hide loader
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('hide');
        setTimeout(() => { loader.style.display = 'none'; }, 600);
    }

    // Theme toggle
    const savedTheme = (() => { try { return localStorage.getItem('theme'); } catch(e) { return null; } })();
    if (savedTheme === 'light') document.body.setAttribute('data-theme', 'light');

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const isLight = document.body.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.body.removeAttribute('data-theme');
            try { localStorage.setItem('theme', 'dark'); } catch(e) {}
        } else {
            document.body.setAttribute('data-theme', 'light');
            try { localStorage.setItem('theme', 'light'); } catch(e) {}
        }
    });

    // Language menu
    const langToggle = document.getElementById('lang-toggle');
    const langMenu = document.getElementById('lang-menu');
    langToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => langMenu?.classList.add('hidden'));

    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const lang = btn.dataset.lang;
            await i18n.setLanguage(lang);
            langMenu.classList.add('hidden');
            document.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (state.currentQ > 0 && state.currentQ < TOTAL_QUESTIONS) {
                renderQuestion();
            } else if (state.primaryType && document.getElementById('result-screen')?.classList.contains('active')) {
                renderResult();
            }
        });
    });

    // Mark active lang
    const currentLangBtn = document.querySelector(`.lang-option[data-lang="${i18n.currentLang}"]`);
    if (currentLangBtn) currentLangBtn.classList.add('active');

    // Start button
    document.getElementById('btn-start')?.addEventListener('click', () => {
        resetState();
        renderResult._trackedThisRun = false;
        showScreen('quiz-screen');
        renderQuestion();
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quiz_start', { event_category: 'work_style' });
            gtag('event', 'test_start', { app_name: 'work-style', content_type: 'work_style_quiz' });
        }
    });

    // Skip button
    document.getElementById('btn-skip')?.addEventListener('click', () => {
        // Skip by picking random type (doesn't skew results much)
        const randomIdx = Math.floor(Math.random() * 5);
        selectAnswer(randomIdx);
    });

    // Share modal
    document.getElementById('share-close')?.addEventListener('click', closeShareModal);
    document.getElementById('share-modal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('share-modal')) closeShareModal();
    });

    // Share buttons
    document.getElementById('share-twitter')?.addEventListener('click', () => {
        const text = buildShareText();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });

    document.getElementById('share-facebook')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank', 'noopener');
    });

    document.getElementById('share-kakaotalk')?.addEventListener('click', () => {
        const text = buildShareText();
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });

    document.getElementById('share-copy')?.addEventListener('click', async () => {
        const shareUrl = getShareUrl();
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast(i18n.t('share.copied'));
        } catch (e) {
            showToast(shareUrl);
        }
        closeShareModal();
    });

    document.getElementById('share-native')?.addEventListener('click', async () => {
        const shareUrl = getShareUrl();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: i18n.t('app.title'),
                    text: buildShareText(),
                    url: shareUrl
                });
            } catch (e) {}
        } else {
            document.getElementById('share-copy').click();
        }
    });

    // Service Worker
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('sw.js');
        } catch (e) {}
    }
})();
