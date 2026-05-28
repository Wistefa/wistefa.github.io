'use strict';

// ===================== ERKLÄR-DATEN (5 Beispiele + Stimme) =====================

// Jedes Beispiel: { a, b, result, voice, stageHtml }
const EXPLAIN_DATA = {
  add: {
    char: '🐸', title: 'Addieren  ➕', opColor: '#56ab2f',
    intro: 'Hallo! Ich bin Fridolin Frosch! Beim Addieren zählst du alles zusammen!',
    examples: [
      mkAdd(2, 1, '🍎', 'Fridolin hat 2 Äpfel. Er findet noch 1 mehr. 2 plus 1 ist gleich 3.'),
      mkAdd(3, 2, '🌸', 'Am Teich sieht Fridolin 3 Seerosen. Es kommen 2 dazu. 3 plus 2 ist gleich 5.'),
      mkAdd(4, 3, '⭐', 'Fridolin sammelt 4 Sterne. Dann findet er 3 weitere. 4 plus 3 ist gleich 7.'),
      mkAdd(5, 2, '🐟', '5 Fische schwimmen im Teich. 2 weitere kommen dazu. 5 plus 2 ist gleich 7.'),
      mkAdd(6, 3, '🍄', 'Im Wald stehen 6 Pilze. Dann wachsen 3 neue. 6 plus 3 ist gleich 9.'),
    ],
  },

  sub: {
    char: '🐰', title: 'Subtrahieren  ➖', opColor: '#f44336',
    intro: 'Halli-Hallo! Ich bin Hoppel Hase! Beim Subtrahieren nimmst du Dinge weg!',
    examples: [
      mkSub(5, 2, '🥕', 'Hoppel hat 5 Möhren. Er verschenkt 2 davon. 5 minus 2 ist gleich 3.'),
      mkSub(6, 3, '🍓', '6 Erdbeeren liegen im Korb. Hoppel isst 3 auf. 6 minus 3 ist gleich 3.'),
      mkSub(7, 4, '🌷', '7 Blumen blühen. Der Wind bricht 4 ab. 7 minus 4 ist gleich 3.'),
      mkSub(8, 5, '🫐', '8 Beeren sind im Topf. Hoppel nimmt 5 raus. 8 minus 5 ist gleich 3.'),
      mkSub(9, 3, '🍏', '9 grüne Äpfel hängen am Baum. 3 fallen runter. 9 minus 3 ist gleich 6.'),
    ],
  },

  mul: {
    char: '🕷️', title: 'Multiplizieren  ✖️', opColor: '#2196F3',
    intro: 'Hey! Ich bin Willi Spinne! Beim Multiplizieren addierst du ganz schnell gleiche Gruppen!',
    examples: [
      mkMul(2, 3, '⭐', 'Willi hat 2 Gruppen mit je 3 Sternen. 2 mal 3 ist gleich 6.'),
      mkMul(3, 2, '🍬', '3 Tüten haben je 2 Bonbons. 3 mal 2 ist gleich 6.'),
      mkMul(2, 4, '🎈', '2 Kinder haben je 4 Ballons. 2 mal 4 ist gleich 8.'),
      mkMul(3, 3, '🐝', '3 Blumen haben je 3 Bienen. 3 mal 3 ist gleich 9.'),
      mkMul(4, 2, '🦋', '4 Büsche haben je 2 Schmetterlinge. 4 mal 2 ist gleich 8.'),
    ],
  },

  div: {
    char: '🐻', title: 'Dividieren  ➗', opColor: '#FF9800',
    intro: 'Brumm brumm! Ich bin Bruno Bär! Beim Dividieren teilst du Dinge gleichmäßig auf!',
    examples: [
      mkDiv(6, 2, '🍯', 'Bruno hat 6 Honigtöpfe und 2 Freunde. 6 geteilt durch 2 ist gleich 3. Jeder bekommt 3.'),
      mkDiv(8, 4, '🍪', '8 Kekse werden auf 4 Bären aufgeteilt. 8 geteilt durch 4 ist gleich 2.'),
      mkDiv(9, 3, '🫐', '9 Beeren werden auf 3 Teller verteilt. 9 geteilt durch 3 ist gleich 3.'),
      mkDiv(10, 2, '🐟', '10 Fische schwimmen in 2 Teiche. 10 geteilt durch 2 ist gleich 5.'),
      mkDiv(12, 4, '🌰', '12 Nüsse werden auf 4 Eichhörnchen verteilt. 12 geteilt durch 4 ist gleich 3.'),
    ],
  },

  mix: {
    char: '🎲', title: 'Gemischt  🎲', opColor: '#9C27B0',
    intro: 'Hallo! Ich bin Würfeli! Hier kommen alle 4 Rechenarten bunt gemischt!',
    examples: [
      mkAdd(3, 4, '🌟', 'Plus! 3 plus 4 ist gleich 7.'),
      mkSub(7, 3, '🍎', 'Minus! 7 minus 3 ist gleich 4.'),
      mkMul(2, 5, '🎈', 'Mal! 2 mal 5 ist gleich 10.'),
      mkDiv(8, 2, '🍯', 'Geteilt durch! 8 geteilt durch 2 ist gleich 4.'),
      mkAdd(5, 5, '⭐', 'Plus! 5 plus 5 ist gleich 10. Jetzt bist du dran!'),
    ],
  },
};

// ---- Beispiel-Builder ----
function mkAdd(a, b, em, voice) {
  return {
    a, b, result: a + b, op: '+', opWord: 'plus', voice,
    stage: stageAdd(em, a, b),
  };
}
function mkSub(a, b, em, voice) {
  return {
    a, b, result: a - b, op: '−', opWord: 'minus', voice,
    stage: stageSub(em, a, b),
  };
}
function mkMul(a, b, em, voice) {
  return {
    a, b, result: a * b, op: '×', opWord: 'mal', voice,
    stage: stageMul(em, a, b),
  };
}
function mkDiv(a, b, em, voice) {
  return {
    a, b, result: a / b, op: '÷', opWord: 'geteilt durch', voice,
    stage: stageDiv(em, a, b),
  };
}

// ---- Bühnen-Builder ----
function stageAdd(em, a, b) {
  let h = '';
  for (let i = 0; i < a; i++)
    h += `<span class="stage-item" style="animation-delay:${i*70}ms">${em}</span>`;
  h += `<span class="stage-plus-sign">+</span>`;
  for (let i = 0; i < b; i++)
    h += `<span class="stage-item arrive" style="animation-delay:${(a+i)*70}ms">${em}</span>`;
  return h;
}

function stageSub(em, a, b) {
  let h = '';
  const keep = a - b;
  for (let i = 0; i < a; i++) {
    const cls = i >= keep ? ' gone' : '';
    h += `<span class="stage-item${cls}" style="animation-delay:${i*70}ms">${em}</span>`;
  }
  h += `<div class="stage-note">❌ ${b} werden weggegeben</div>`;
  return h;
}

function stageMul(em, rows, perRow) {
  let h = '';
  for (let r = 0; r < rows; r++) {
    h += `<div class="stage-group"><div class="stage-group-label">Gruppe ${r+1}</div>`;
    for (let i = 0; i < perRow; i++)
      h += `<span class="stage-item" style="animation-delay:${(r*perRow+i)*60}ms">${em}</span>`;
    h += `</div>`;
  }
  return h;
}

function stageDiv(em, total, groups) {
  const per = total / groups;
  let h = '';
  for (let g = 0; g < groups; g++) {
    h += `<div class="stage-group"><div class="stage-group-label">🐻 ${g+1}</div>`;
    for (let i = 0; i < per; i++)
      h += `<span class="stage-item" style="animation-delay:${(g*per+i)*65}ms">${em}</span>`;
    h += `</div>`;
  }
  return h;
}

// ---- Formel-HTML ----
function fmlHtml(a, op, b, result) {
  return `<span class="fml-num">${a}</span>
          <span class="fml-op">${op}</span>
          <span class="fml-num">${b}</span>
          <span class="fml-eq">=</span>
          <span class="fml-res">${result}</span>`;
}

// ===================== WEB SPEECH API =====================
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = 'de-DE';
  utter.rate  = 0.88;
  utter.pitch = 1.1;

  // Sprecher-Button animieren
  const btn = document.getElementById('btn-speak');
  if (btn) {
    btn.classList.add('speaking');
    utter.onend = () => btn.classList.remove('speaking');
    utter.onerror = () => btn.classList.remove('speaking');
  }
  window.speechSynthesis.speak(utter);
}

// Beim Laden Stimmen initialisieren (Chrome braucht das)
if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// ===================== CONFIG =====================
const QUESTIONS_PER_ROUND = 10;

const LEVEL_RANGES = {
  1: { min: 1, max: 10 },
  2: { min: 1, max: 20 },
  3: { min: 1, max: 100 },
};

const OP_SYMBOLS = {
  add: '+',
  sub: '−',
  mul: '×',
  div: '÷',
};

const CORRECT_MESSAGES = [
  '🎉 Super gemacht!', '🌟 Richtig!', '🏆 Toll!', '🥳 Genial!',
  '✨ Wunderbar!', '🦸 Klasse!', '🎊 Bravo!', '🌈 Fantastisch!',
  '💪 Weiter so!', '🐣 Das war easy!',
];

const WRONG_MESSAGES = [
  '😅 Nicht ganz – versuch es nochmal!',
  '🙈 Knapp daneben – du schaffst das!',
  '💡 Fast! Die richtige Antwort war: ',
  '🤔 Nochmal nachdenken …',
  '🐢 Kein Stress – weiter!',
];

// ===================== STATE =====================
let state = {
  operation: 'add',
  level: 1,
  questions: [],
  current: 0,
  score: 0,
  errors: 0,
  waitingNext: false,
};

// ===================== ELEMENTS =====================
const screens = {
  start:   document.getElementById('screen-start'),
  explain: document.getElementById('screen-explain'),
  game:    document.getElementById('screen-game'),
  result:  document.getElementById('screen-result'),
};

const el = {
  levelBtns:   document.querySelectorAll('.level-btn'),
  opBtns:      document.querySelectorAll('.op-btn'),
  btnBack:     document.getElementById('btn-back'),
  score:       document.getElementById('score'),
  errors:      document.getElementById('errors'),
  progressBar: document.getElementById('progress-bar'),
  qCurrent:    document.getElementById('q-current'),
  qTotal:      document.getElementById('q-total'),
  num1:        document.getElementById('num1'),
  opSymbol:    document.getElementById('op-symbol'),
  num2:        document.getElementById('num2'),
  answerInput: document.getElementById('answer-input'),
  btnCheck:    document.getElementById('btn-check'),
  feedback:    document.getElementById('feedback'),
  npBtns:      document.querySelectorAll('.np-btn'),
  // explain
  expChar:       document.getElementById('exp-char'),
  expOpTitle:    document.getElementById('exp-op-title'),
  expCounter:    document.getElementById('exp-example-counter'),
  expFormulaBig: document.getElementById('exp-formula-big'),
  expStage:      document.getElementById('exp-stage'),
  expDots:       document.getElementById('exp-dots'),
  btnSkip:       document.getElementById('btn-skip'),
  btnSpeak:      document.getElementById('btn-speak'),
  btnPrevStep:   document.getElementById('btn-prev-step'),
  btnNextStep:   document.getElementById('btn-next-step'),
  btnLetsGo:     document.getElementById('btn-lets-go'),
  // result
  resultEmoji: document.getElementById('result-emoji'),
  resultTitle: document.getElementById('result-title'),
  resultMsg:   document.getElementById('result-msg'),
  resCorrect:  document.getElementById('res-correct'),
  resErrors:   document.getElementById('res-errors'),
  resStars:    document.getElementById('res-stars'),
  btnRetry:    document.getElementById('btn-retry'),
  btnHome:     document.getElementById('btn-home'),
};

// ===================== SCREEN NAVIGATION =====================
function showScreen(name) {
  Object.entries(screens).forEach(([key, s]) => {
    s.classList.toggle('active', key === name);
  });
}

// ===================== LEVEL SELECT =====================
el.levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    el.levelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.level = parseInt(btn.dataset.level);
  });
});

// ===================== OPERATION SELECT =====================
el.opBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.operation = btn.dataset.op;
    document.body.dataset.op = state.operation;
    showExplain();
  });
});

// ===================== ERKLÄRBILDSCHIRM =====================
let explainStep = 0;

function showExplain() {
  explainStep = 0;
  showScreen('explain');
  const data = EXPLAIN_DATA[state.operation];
  // Intro vorlesen, dann erstes Beispiel
  speak(data.intro);
  // Verzögerung: Intro fertig, dann Beispiel 0 rendern + vorlesen
  const introLen = data.intro.length;
  const introMs  = Math.max(1800, introLen * 55);
  setTimeout(() => renderExplainStep(true), introMs);
  renderExplainStep(false); // Layout sofort zeigen, aber noch nicht sprechen
}

function renderExplainStep(autoSpeak) {
  const data     = EXPLAIN_DATA[state.operation];
  const examples = data.examples;
  const ex       = examples[explainStep];
  const isLast   = explainStep === examples.length - 1;
  const isFirst  = explainStep === 0;

  // Kopfzeile
  el.expChar.textContent   = data.char;
  el.expOpTitle.textContent = data.title;
  el.expCounter.textContent = `Beispiel ${explainStep + 1} von ${examples.length}`;

  // Formel
  el.expFormulaBig.innerHTML = fmlHtml(ex.a, ex.op, ex.b, ex.result);

  // Bühne
  el.expStage.innerHTML = ex.stage;

  // Punkte
  el.expDots.innerHTML = examples.map((_, i) =>
    `<div class="exp-dot ${i === explainStep ? 'active' : ''}"></div>`
  ).join('');

  // Buttons
  el.btnPrevStep.disabled = isFirst;
  el.btnNextStep.classList.toggle('hidden', isLast);
  el.btnLetsGo.classList.toggle('hidden', !isLast);

  if (autoSpeak) speak(ex.voice);
}

el.btnNextStep.addEventListener('click', () => {
  const max = EXPLAIN_DATA[state.operation].examples.length - 1;
  if (explainStep < max) { explainStep++; renderExplainStep(true); }
});

el.btnPrevStep.addEventListener('click', () => {
  if (explainStep > 0) { explainStep--; renderExplainStep(true); }
});

el.btnSpeak.addEventListener('click', () => {
  const ex = EXPLAIN_DATA[state.operation].examples[explainStep];
  speak(ex.voice);
});

el.btnLetsGo.addEventListener('click', () => {
  window.speechSynthesis && window.speechSynthesis.cancel();
  startGame();
});
el.btnSkip.addEventListener('click', () => {
  window.speechSynthesis && window.speechSynthesis.cancel();
  startGame();
});

// ===================== QUESTION GENERATION =====================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(op, level) {
  const { min, max } = LEVEL_RANGES[level];
  let a, b, answer;

  const actualOp = (op === 'mix')
    ? ['add', 'sub', 'mul', 'div'][Math.floor(Math.random() * 4)]
    : op;

  switch (actualOp) {
    case 'add':
      a = rand(min, max);
      b = rand(min, max);
      answer = a + b;
      break;

    case 'sub':
      a = rand(min, max);
      b = rand(min, a); // b <= a so result >= 0
      answer = a - b;
      break;

    case 'mul':
      // Keep mul manageable for children
      a = rand(1, Math.min(max, 10));
      b = rand(1, Math.min(max, 10));
      answer = a * b;
      break;

    case 'div':
      // Generate a clean division (no remainder)
      b = rand(1, Math.min(max, 10));
      answer = rand(1, Math.min(max, 10));
      a = b * answer; // a = divisor × result
      break;
  }

  return { a, b, op: actualOp, answer };
}

function generateQuestions() {
  const qs = [];
  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    qs.push(generateQuestion(state.operation, state.level));
  }
  return qs;
}

// ===================== GAME START =====================
function startGame() {
  state.questions = generateQuestions();
  state.current   = 0;
  state.score     = 0;
  state.errors    = 0;
  state.waitingNext = false;

  document.body.dataset.op = state.operation;

  el.qTotal.textContent = QUESTIONS_PER_ROUND;
  updateScoreDisplay();
  showScreen('game');
  loadQuestion();
  el.answerInput.focus();
}

// ===================== LOAD QUESTION =====================
function loadQuestion() {
  const q = state.questions[state.current];

  el.qCurrent.textContent = state.current + 1;
  el.num1.textContent      = q.a;
  el.opSymbol.textContent  = OP_SYMBOLS[q.op];
  el.num2.textContent      = q.b;
  el.answerInput.value     = '';
  el.feedback.className    = 'feedback hidden';
  el.feedback.textContent  = '';
  state.waitingNext        = false;

  updateProgress();
  el.answerInput.focus();
}

function updateProgress() {
  const pct = (state.current / QUESTIONS_PER_ROUND) * 100;
  el.progressBar.style.width = pct + '%';
}

function updateScoreDisplay() {
  el.score.textContent  = state.score;
  el.errors.textContent = state.errors;
}

// ===================== CHECK ANSWER =====================
function checkAnswer() {
  if (state.waitingNext) { nextQuestion(); return; }

  const val = el.answerInput.value.trim();
  if (val === '') { el.answerInput.focus(); return; }

  const userAnswer = parseInt(val, 10);
  const correct    = state.questions[state.current].answer;

  if (userAnswer === correct) {
    state.score++;
    showFeedback(true, '');
  } else {
    state.errors++;
    const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
    const extra = msg.includes('war:') ? correct : '';
    showFeedback(false, msg + (extra !== '' ? ' ' + extra : ''));
  }

  updateScoreDisplay();
  state.waitingNext = true;

  // Auto-advance after 1.4 s
  setTimeout(() => { if (state.waitingNext) nextQuestion(); }, 1400);
}

function showFeedback(isCorrect, msg) {
  el.feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'wrong');
  el.feedback.textContent = isCorrect
    ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
    : msg;
}

function nextQuestion() {
  state.current++;
  if (state.current >= QUESTIONS_PER_ROUND) {
    showResult();
  } else {
    loadQuestion();
  }
}

// ===================== RESULT SCREEN =====================
function showResult() {
  const correct = state.score;
  const total   = QUESTIONS_PER_ROUND;
  const pct     = correct / total;

  let emoji, title, msg;
  if (pct === 1) {
    emoji = '🏆'; title = 'Perfekt!';
    msg = 'Alle richtig – du bist ein Mathe-Genie!';
  } else if (pct >= 0.8) {
    emoji = '🌟'; title = 'Super!';
    msg = 'Toll gemacht! Fast alles richtig!';
  } else if (pct >= 0.6) {
    emoji = '😊'; title = 'Gut!';
    msg = 'Schon gut! Noch ein bisschen üben!';
  } else if (pct >= 0.4) {
    emoji = '💪'; title = 'Weiter üben!';
    msg = 'Du schaffst das! Probier es nochmal!';
  } else {
    emoji = '🐢'; title = 'Nicht aufgeben!';
    msg = 'Üben macht den Meister – nochmal versuchen!';
  }

  el.resultEmoji.textContent = emoji;
  el.resultTitle.textContent = title;
  el.resultMsg.textContent   = msg;
  el.resCorrect.textContent  = correct;
  el.resErrors.textContent   = state.errors;
  el.resStars.textContent    = state.score;

  el.progressBar.style.width = '100%';
  showScreen('result');
}

// ===================== BUTTONS =====================
el.btnCheck.addEventListener('click', checkAnswer);

el.btnBack.addEventListener('click', () => {
  showScreen('start');
  document.body.removeAttribute('data-op');
});


el.btnRetry.addEventListener('click', startGame);

el.btnHome.addEventListener('click', () => {
  showScreen('start');
  document.body.removeAttribute('data-op');
});

// Enter key
el.answerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAnswer();
});

// ===================== NUMPAD =====================
el.npBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.val;
    if (val === 'del') {
      el.answerInput.value = el.answerInput.value.slice(0, -1);
    } else {
      if (state.waitingNext) { nextQuestion(); return; }
      el.answerInput.value += val;
    }
    el.answerInput.focus();
  });
});
