import { SRS_STAGES } from './data.js';

// --- DOM Elements (Initialized in app.js) ---
let DOM = {};

export function initializeUI(elements) {
    DOM = elements;
}

// --- Screen Management ---
export function showScreen(screenName, fromScreen = null) {
    if (fromScreen) DOM.state.previousScreen = fromScreen;
    Object.values(DOM.screens).forEach(screen => screen.classList.add('hidden'));
    DOM.screens[screenName].classList.remove('hidden');

    if (DOM.state.countdownInterval) {
        clearInterval(DOM.state.countdownInterval);
        DOM.state.countdownInterval = null;
    }
    if (screenName === 'reviewCenter') {
        populateReviewCenter();
    }
}

// --- Card Creation ---
export function createSentenceCard(sentence, repsDone, repsNeeded) {
    const card = document.createElement('div');
    card.className = 'sentence-card';
    const isCompleted = repsDone >= repsNeeded;

    card.innerHTML = `
        <div class="sc-header">
            <div class="sc-rep-counter ${isCompleted ? 'completed' : ''}">${repsDone} / ${repsNeeded}</div>
            <div class="sc-context">${sentence.context}</div>
        </div>
        ${sentence.tip_ar ? `
        <div class="sc-tip">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.42-1.42-2.5-3.52-2.5-6.097C4.5 6.097 6.75 4.5 9.75 4.5s5.25 1.597 5.25 4.185c0 2.577-1.08 4.677-2.5 6.097Z" />
            </svg>
            <span>${sentence.tip_ar}</span>
        </div>
        ` : ''}
        <div class="sc-en">${sentence.en.replace(new RegExp(sentence.highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), `<span class="highlight">${sentence.highlight}</span>`)}</div>
        <div class="sc-ar">${sentence.ar}</div>
        <div class="sc-pronunciation">
            <div>${sentence.pronunciation_en || ''}</div>
            <div dir="rtl">${sentence.pronunciation_ar || ''}</div>
        </div>
    `;
    return card;
}

function createReviewLessonCard(lessonKey, status, getLessonSentences) {
    const card = document.createElement('div');
    card.className = 'review-lesson-card';
    card.dataset.lessonKey = lessonKey;
    card.dataset.srsStage = status.stage;

    const icon = status.status === 'locked' 
        ? `<svg class="review-lesson-status-icon" style="stroke: var(--locked-color);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>`
        : `<svg class="review-lesson-status-icon" style="stroke: var(--success-color);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>`;

    card.innerHTML = `
        <div class="review-lesson-card-header">
            <div class="review-lesson-title">${lessonKey}</div>
            ${icon}
        </div>
        ${status.status === 'locked' ? `<div class="review-lesson-countdown" data-due="${status.dueTimestamp}"></div>` : ''}
        <div class="review-lesson-sentences"></div>
    `;
    
    if (status.status === 'locked') {
        card.classList.add('locked');
    } else {
        card.addEventListener('click', () => {
            const sentencesContainer = card.querySelector('.review-lesson-sentences');
            const isVisible = sentencesContainer.style.display === 'block';
            if (isVisible) {
                sentencesContainer.style.display = 'none';
            } else {
                if (sentencesContainer.innerHTML === '') {
                    const sentences = getLessonSentences(lessonKey);
                    sentences.forEach(s => {
                        const sCard = createSentenceCard(s, '✓', '✓');
                        sentencesContainer.appendChild(sCard);
                    });
                }
                sentencesContainer.style.display = 'block';
            }
        });
    }
    return card;
}

// --- UI Population ---
export function populateLessonScreen(levelKey, lessonKey, progress, getLessonSentences) {
    DOM.state.currentLevelKey = levelKey;
    DOM.state.currentLessonKey = lessonKey;
    
    const lessonData = getLessonSentences(lessonKey, true);
    const lessonProgress = progress[lessonKey];
    const repsNeeded = SRS_STAGES[lessonProgress.stage].reps;
    
    DOM.lessonViewTitle.textContent = lessonData.title;
    DOM.lessonSentenceList.innerHTML = '';
    
    let incompleteSentences = 0;
    lessonData.sentences.forEach(sentence => {
        const repsDone = lessonProgress.sentenceProgress[sentence.id] || 0;
        if (repsDone < repsNeeded) {
            incompleteSentences++;
        }
        const card = createSentenceCard(sentence, repsDone, repsNeeded);
        DOM.lessonSentenceList.appendChild(card);
    });

    const isLessonComplete = incompleteSentences === 0;
    if (isLessonComplete) {
        if (lessonProgress.stage === 0 && progress[lessonKey].lastCompletion === null) {
            progress[lessonKey].stage = 1;
            progress[lessonKey].lastCompletion = new Date().toISOString();
            // Call saveProgress from app.js
        }
        DOM.startLessonPracticeBtn.textContent = lessonProgress.stage === 0 ? 'الدرس مكتمل! اذهب للمراجعة' : 'تمت المراجعة!';
        DOM.startLessonPracticeBtn.disabled = true;
    } else {
        DOM.startLessonPracticeBtn.textContent = `ابدأ التمرين (${incompleteSentences} جمل متبقية)`;
        DOM.startLessonPracticeBtn.disabled = false;
    }
}

export function populateReviewCenter(progress, getLessonStatus, getLessonSentences) {
    DOM.reviewListContainer.innerHTML = '';
    const sections = {};
    let activeLessonsForReview = [];

    Object.keys(progress).forEach(lessonKey => {
        const status = getLessonStatus(lessonKey);
        if (status.status === 'learning') return;

        const stage = status.stage;
        if (!sections[stage]) {
            sections[stage] = document.createElement('div');
            sections[stage].className = 'review-stage-section';
            sections[stage].innerHTML = `<div class="review-stage-title">${SRS_STAGES[stage].name}</div>`;
        }
        
        const lessonCard = createReviewLessonCard(lessonKey, status, getLessonSentences);
        sections[stage].appendChild(lessonCard);

        if(status.status === 'active') {
            activeLessonsForReview.push(lessonKey);
        }
    });

    Object.keys(sections).sort().forEach(stageKey => DOM.reviewListContainer.appendChild(sections[stageKey]));
    
    DOM.startGlobalReviewBtn.disabled = activeLessonsForReview.length === 0;
    DOM.startGlobalReviewBtn.textContent = activeLessonsForReview.length > 0 ? `ابدأ المراجعة (${activeLessonsForReview.length} دروس)` : 'لا يوجد مراجعات متاحة';

    if (document.querySelector('.review-lesson-countdown')) {
        DOM.state.countdownInterval = setInterval(() => updateAllCountdowns(populateReviewCenter, progress, getLessonStatus, getLessonSentences), 1000);
    }
}

function updateAllCountdowns(callback, ...args) {
    document.querySelectorAll('.review-lesson-countdown').forEach(el => {
        const due = parseInt(el.dataset.due, 10);
        const now = new Date().getTime();
        const diff = due - now;

        if (diff <= 0) {
            el.textContent = 'جاهز للمراجعة!';
            if(!el.closest('.review-lesson-card').classList.contains('refreshed')) {
                el.closest('.review-lesson-card').classList.add('refreshed');
                callback(...args); // Refresh the whole view
            }
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        el.textContent = `يفتح بعد: ${d > 0 ? `${d}ي ` : ''}${h}س ${m}د ${s}ث`;
    });
}

// --- Practice Screen UI ---
export function updatePracticeScreen(sentence, repsDone, repsNeeded) {
    DOM.practiceContext.textContent = sentence.context;
    DOM.practiceTextAr.textContent = sentence.ar;
    DOM.practiceTextEn.innerHTML = sentence.en.replace(new RegExp(sentence.highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), `<span class="highlight">${sentence.highlight}</span>`);
    DOM.practicePronunciationEn.textContent = sentence.pronunciation_en || '';
    DOM.practicePronunciationAr.textContent = sentence.pronunciation_ar || '';
    DOM.practiceCounter.textContent = `${repsDone} / ${repsNeeded}`;

    if (sentence.tip_ar) {
        DOM.practiceTipContainer.innerHTML = `
            <div class="sc-tip">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.42-1.42-2.5-3.52-2.5-6.097C4.5 6.097 6.75 4.5 9.75 4.5s5.25 1.597 5.25 4.185c0 2.577-1.08 4.677-2.5 6.097Z" />
                </svg>
                <span>${sentence.tip_ar}</span>
            </div>`;
        DOM.practiceTipContainer.style.display = 'block';
    } else {
        DOM.practiceTipContainer.style.display = 'none';
    }
}

// --- Writing Exercise UI ---
export function setupWritingExercise() {
    DOM.writingExerciseInput.value = '';
    DOM.writingExerciseFeedback.textContent = '';
    DOM.writingExerciseInput.disabled = false;
    DOM.writingExerciseCheckBtn.disabled = false;
    showScreen('writingExercise', 'practice');
}
