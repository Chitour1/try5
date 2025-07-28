import { SRS_STAGES, LESSON_LIBRARY } from './data.js';
import * as UI from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const DOM = {
        screens: {
            start: document.getElementById('start-screen'),
            reviewCenter: document.getElementById('review-center-screen'),
            levelSelection: document.getElementById('level-selection-screen'),
            lessonSelection: document.getElementById('lesson-selection-screen'),
            lesson: document.getElementById('lesson-screen'),
            practice: document.getElementById('practice-screen'),
            writingExercise: document.getElementById('writing-exercise-screen'),
            sessionComplete: document.getElementById('session-complete-screen'),
        },
        // Buttons
        goToLevelSelectionBtn: document.getElementById('go-to-level-selection-btn'),
        goToReviewCenterBtn: document.getElementById('go-to-review-center-btn'),
        startGlobalReviewBtn: document.getElementById('start-global-review-btn'),
        startLessonPracticeBtn: document.getElementById('start-lesson-practice-btn'),
        practiceBanner: document.getElementById('practice-banner'),
        practiceSpeakerIcon: document.getElementById('practice-speaker-icon'),
        writingExerciseCheckBtn: document.getElementById('writing-exercise-check-btn'),
        writingExerciseSkipBtn: document.getElementById('writing-exercise-skip-btn'),
        backToMainFromComplete: document.getElementById('back-to-main-from-complete'),
        backToPreviousScreenBtn: document.getElementById('back-to-previous-screen'),
        // Lists & Containers
        levelList: document.getElementById('level-list'),
        lessonList: document.getElementById('lesson-list'),
        reviewListContainer: document.getElementById('review-list-container'),
        lessonSentenceList: document.getElementById('lesson-sentence-list'),
        // Lesson Screen
        lessonViewTitle: document.getElementById('lesson-view-title'),
        // Practice Screen
        practiceContext: document.getElementById('practice-context'),
        practiceTextAr: document.getElementById('practice-text-ar'),
        practiceTextEn: document.getElementById('practice-text-en'),
        practicePronunciationEn: document.getElementById('practice-pronunciation-en'),
        practicePronunciationAr: document.getElementById('practice-pronunciation-ar'),
        practiceTipContainer: document.getElementById('practice-tip-container'),
        practiceCounter: document.getElementById('practice-counter'),
        // Writing Exercise
        writingExerciseInput: document.getElementById('writing-exercise-input'),
        writingExerciseFeedback: document.getElementById('writing-exercise-feedback'),
        // State object to pass to UI module
        state: {
            previousScreen: 'start',
            countdownInterval: null,
            currentLevelKey: null,
            currentLessonKey: null,
            lastPracticedLessonKey: null,
        }
    };

    // --- State ---
    let progress = {};
    let practiceList = [];
    let currentPracticeItem = null;
    let voices = [];

    // --- Initialization ---
    UI.initializeUI(DOM);
    loadProgress();
    loadVoices();
    UI.showScreen('start');

    // --- Audio ---
    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
            };
        }
    }

    function speakSentence(text) {
        if (!('speechSynthesis' in window)) return;
        if (voices.length === 0) loadVoices();

        const utterance = new SpeechSynthesisUtterance(text);
        const englishVoice = voices.find(voice => voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB'));
        utterance.voice = englishVoice || voices.find(voice => voice.lang.startsWith('en-'));
        utterance.lang = 'en-US';
        utterance.rate = 0.4; // Slower speed
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }

    // --- Progress & SRS Logic ---
    function loadProgress() {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        progress = savedProgress ? JSON.parse(savedProgress) : {};
    }

    function saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
    
    function initializeLessonProgress(lessonKey) {
        if (!progress[lessonKey]) {
            const sentences = getLessonSentences(lessonKey);
            progress[lessonKey] = {
                stage: 0,
                lastCompletion: null,
                sentenceProgress: sentences.reduce((acc, s) => {
                    acc[s.id] = 0;
                    return acc;
                }, {})
            };
            saveProgress();
        }
    }

    function getLessonSentences(lessonKey, withTitle = false) {
        for (const level of Object.values(LESSON_LIBRARY)) {
            if (level[lessonKey]) {
                return withTitle ? level[lessonKey] : level[lessonKey].sentences;
            }
        }
        return withTitle ? { title: '', sentences: [] } : [];
    }
    
    function getLessonStatus(lessonKey) {
        const lessonProgress = progress[lessonKey];
        if (!lessonProgress || lessonProgress.stage === 0) {
            return { status: 'learning', stage: 0 };
        }

        if (lessonProgress.stage >= SRS_STAGES.length -1) {
            return { status: 'mastered', stage: lessonProgress.stage };
        }

        const completionTime = new Date(lessonProgress.lastCompletion).getTime();
        const intervalMillis = SRS_STAGES[lessonProgress.stage].intervalDays * 24 * 60 * 60 * 1000;
        const dueTime = completionTime + intervalMillis;
        const now = new Date().getTime();
        
        if (now >= dueTime) {
            return { status: 'active', stage: lessonProgress.stage };
        } else {
            return { status: 'locked', stage: lessonProgress.stage, dueTimestamp: dueTime };
        }
    }
    
    // --- Practice Flow ---
    function startPracticeSession(isGlobal = false) {
        practiceList = [];
        let lessonsToPractice = isGlobal 
            ? Object.keys(progress).filter(lk => getLessonStatus(lk).status === 'active')
            : [DOM.state.currentLessonKey];
        
        DOM.state.lastPracticedLessonKey = lessonsToPractice.length > 0 ? lessonsToPractice[0] : null;

        lessonsToPractice.forEach(lessonKey => {
            const lessonProgress = progress[lessonKey];
            const repsNeeded = SRS_STAGES[lessonProgress.stage].reps;
            const sentences = getLessonSentences(lessonKey);

            sentences.forEach(sentence => {
                const repsDone = lessonProgress.sentenceProgress[sentence.id] || 0;
                if (repsDone < repsNeeded) {
                    for (let i = 0; i < (repsNeeded - repsDone); i++) {
                        practiceList.push({ sentence, lessonKey });
                    }
                }
            });
        });

        if (practiceList.length === 0) { return; }
        
        practiceList.sort(() => Math.random() - 0.5); // Shuffle
        
        currentPracticeItem = -1;
        UI.showScreen('practice', isGlobal ? 'reviewCenter' : 'lesson');
        displayNextPracticeItem();
    }

    function displayNextPracticeItem() {
        currentPracticeItem++;
        if (currentPracticeItem >= practiceList.length) {
            UI.setupWritingExercise();
            return;
        }
        
        const { sentence, lessonKey } = practiceList[currentPracticeItem];
        const repsDone = progress[lessonKey].sentenceProgress[sentence.id];
        const repsNeeded = SRS_STAGES[progress[lessonKey].stage].reps;

        UI.updatePracticeScreen(sentence, repsDone, repsNeeded);
        speakSentence(sentence.en);
    }

    function handlePracticeClick() {
        if (currentPracticeItem >= practiceList.length || currentPracticeItem < 0) return;

        DOM.practiceBanner.classList.add('clicked');
        setTimeout(() => { DOM.practiceBanner.classList.remove('clicked'); }, 150);

        const { sentence, lessonKey } = practiceList[currentPracticeItem];
        
        progress[lessonKey].sentenceProgress[sentence.id]++;
        
        const lessonSentences = getLessonSentences(lessonKey);
        const lessonStage = progress[lessonKey].stage;
        const repsNeeded = SRS_STAGES[lessonStage].reps;
        const isLessonComplete = lessonSentences.every(s => progress[lessonKey].sentenceProgress[s.id] >= repsNeeded);

        if (isLessonComplete) {
            progress[lessonKey].stage++;
            progress[lessonKey].lastCompletion = new Date().toISOString();
            lessonSentences.forEach(s => {
                progress[lessonKey].sentenceProgress[s.id] = 0;
            });
        }
        
        saveProgress();
        displayNextPracticeItem();
    }
    
    // --- Event Listeners ---
    DOM.goToLevelSelectionBtn.addEventListener('click', () => {
        DOM.levelList.innerHTML = '';
        Object.keys(LESSON_LIBRARY).forEach(levelKey => {
            const card = document.createElement('div');
            card.className = 'level-card'; card.textContent = levelKey; card.dataset.level = levelKey;
            DOM.levelList.appendChild(card);
        });
        UI.showScreen('levelSelection', 'start');
    });

    DOM.goToReviewCenterBtn.addEventListener('click', () => {
        UI.populateReviewCenter(progress, getLessonStatus, getLessonSentences);
        UI.showScreen('reviewCenter', 'start');
    });

    DOM.startGlobalReviewBtn.addEventListener('click', () => startPracticeSession(true));
    DOM.startLessonPracticeBtn.addEventListener('click', () => startPracticeSession(false));
    DOM.practiceBanner.addEventListener('click', handlePracticeClick);
    
    DOM.practiceSpeakerIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPracticeItem >= 0 && currentPracticeItem < practiceList.length) {
            speakSentence(practiceList[currentPracticeItem].sentence.en);
        }
    });

    DOM.levelList.addEventListener('click', (e) => {
        const card = e.target.closest('.level-card');
        if (card) {
            DOM.state.currentLevelKey = card.dataset.level;
            DOM.lessonList.innerHTML = '';
            Object.keys(LESSON_LIBRARY[DOM.state.currentLevelKey]).forEach(lessonKey => {
                const lCard = document.createElement('div');
                lCard.className = 'lesson-card'; lCard.textContent = lessonKey; lCard.dataset.lesson = lessonKey;
                DOM.lessonList.appendChild(lCard);
            });
            UI.showScreen('lessonSelection', 'levelSelection');
        }
    });

    DOM.lessonList.addEventListener('click', (e) => {
        const card = e.target.closest('.lesson-card');
        if (card) {
            const lessonKey = card.dataset.lesson;
            initializeLessonProgress(lessonKey);
            UI.populateLessonScreen(DOM.state.currentLevelKey, lessonKey, progress, getLessonSentences);
            UI.showScreen('lesson', 'lessonSelection');
        }
    });
    
    DOM.writingExerciseCheckBtn.addEventListener('click', () => {
        const userAnswer = DOM.writingExerciseInput.value.trim().toLowerCase();
        if (userAnswer === DOM.state.lastPracticedLessonKey) {
            DOM.writingExerciseFeedback.textContent = 'صحيح! أحسنت.';
            DOM.writingExerciseFeedback.className = 'feedback-correct';
            DOM.writingExerciseInput.disabled = true;
            DOM.writingExerciseCheckBtn.disabled = true;
            setTimeout(() => UI.showScreen('sessionComplete', 'writingExercise'), 1500);
        } else {
            DOM.writingExerciseFeedback.textContent = `حاول مرة أخرى. الإجابة الصحيحة هي: ${DOM.state.lastPracticedLessonKey}`;
            DOM.writingExerciseFeedback.className = 'feedback-incorrect';
        }
    });

    DOM.writingExerciseSkipBtn.addEventListener('click', () => UI.showScreen('sessionComplete', 'writingExercise'));

    // Back Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.currentTarget.id === 'back-to-previous-screen') {
                UI.showScreen(DOM.state.previousScreen);
            } else {
                UI.showScreen(e.currentTarget.dataset.target);
            }
        });
    });
    
    DOM.backToMainFromComplete.addEventListener('click', () => UI.showScreen('start'));
});
