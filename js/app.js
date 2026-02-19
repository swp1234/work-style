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

    // 10. Share CTA
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'share-cta';
    ctaDiv.textContent = i18n.t('share.compareWith');
    container.appendChild(ctaDiv);

    // 11. Action Buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'action-buttons';
    actionsDiv.innerHTML = `
        <button class="btn-action btn-share" id="btn-share" data-i18n="result.shareBtn">📤 결과 공유하기</button>
        <button class="btn-action btn-retry" id="btn-retry" data-i18n="result.retryBtn">🔄 다시 테스트하기</button>
    `;
    container.appendChild(actionsDiv);

    // 12. Ad Banner
    const adDiv = document.createElement('div');
    adDiv.className = 'ad-banner';
    adDiv.textContent = 'AD';
    container.appendChild(adDiv);

    // Translate new elements
    i18n.updateUI();

    // Bind result buttons
    document.getElementById('btn-share')?.addEventListener('click', openShareModal);
    document.getElementById('btn-retry')?.addEventListener('click', retryTest);

    // Track result
    if (typeof gtag !== 'undefined') {
        gtag('event', 'quiz_complete', { event_category: 'work_style', event_label: pt, value: state.scores[pt] });
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

function buildShareText() {
    const pt = state.primaryType;
    const typData = getTypeData(pt);
    const meta = TYPE_META[pt];
    return `${meta.emoji} ${i18n.t('share.shareText').replace('{{type}}', typData.name).replace('{{enName}}', typData.enName)}\n\nhttps://dopabrain.com/work-style/`;
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
            }
        });
    });

    // Mark active lang
    const currentLangBtn = document.querySelector(`.lang-option[data-lang="${i18n.currentLang}"]`);
    if (currentLangBtn) currentLangBtn.classList.add('active');

    // Start button
    document.getElementById('btn-start')?.addEventListener('click', () => {
        resetState();
        showScreen('quiz-screen');
        renderQuestion();
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quiz_start', { event_category: 'work_style' });
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
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    });

    document.getElementById('share-facebook')?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dopabrain.com/work-style/')}`, '_blank');
    });

    document.getElementById('share-kakaotalk')?.addEventListener('click', () => {
        const text = buildShareText();
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent('https://dopabrain.com/work-style/')}&text=${encodeURIComponent(text)}`, '_blank');
    });

    document.getElementById('share-copy')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('https://dopabrain.com/work-style/');
            showToast(i18n.t('share.copied'));
        } catch (e) {
            showToast('https://dopabrain.com/work-style/');
        }
        closeShareModal();
    });

    document.getElementById('share-native')?.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: i18n.t('app.title'),
                    text: buildShareText(),
                    url: 'https://dopabrain.com/work-style/'
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
