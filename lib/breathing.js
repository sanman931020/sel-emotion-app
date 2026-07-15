/**
 * 引導式呼吸練習 — Box 4-4-4-4、4-7-8 + 身體掃描
 * 支援全螢幕、overlay、淡入淡出
 */
var BREATH_PATTERNS = {
  box: {
    id: 'box',
    label: '方塊呼吸',
    subtitle: '方塊呼吸 · 吸4 屏4 吐4 屏4',
    phases: [
      { label: '吸氣', dur: 4, msg: '用鼻子慢慢吸氣…', ring: 'expand' },
      { label: '屏息', dur: 4, msg: '輕輕屏住呼吸…', ring: 'hold' },
      { label: '吐氣', dur: 4, msg: '用嘴巴緩緩吐氣…', ring: 'contract' },
      { label: '屏息', dur: 4, msg: '感受此刻的寧靜…', ring: 'hold' }
    ],
    defaultTotal: 64
  },
  '478': {
    id: '478',
    label: '4-7-8 呼吸',
    subtitle: '4-7-8 呼吸 · 吸4 屏7 吐8',
    phases: [
      { label: '吸氣', dur: 4, msg: '用鼻子吸氣…', ring: 'expand' },
      { label: '屏息', dur: 7, msg: '輕輕屏住呼吸…', ring: 'hold' },
      { label: '吐氣', dur: 8, msg: '用嘴巴慢慢吐氣…', ring: 'contract' }
    ],
    defaultTotal: 57
  }
};

var BODY_SCAN_ITEMS = [
  { id: 'shoulders', label: '放鬆肩膀', hint: '讓肩膀自然下垂' },
  { id: 'jaw', label: '放鬆下巴', hint: '輕微張開，不要緊咬' },
  { id: 'hands', label: '放鬆雙手', hint: '鬆開握拳，手指輕放' },
  { id: 'brow', label: '放鬆眉心', hint: '額頭與眉間不要用力' },
  { id: 'belly', label: '腹部柔軟', hint: '感受呼吸帶動腹部' }
];

var _breath = {
  timer: null,
  elapsed: 0,
  phaseIdx: 0,
  phaseElapsed: 0,
  totalSecs: 64,
  mode: 'screen',
  pattern: 'box',
  onComplete: null,
  showBodyScan: false,
  bodyScan: {}
};

function getBreathPattern() {
  return BREATH_PATTERNS[_breath.pattern] || BREATH_PATTERNS.box;
}

function getBreathPhases() {
  return getBreathPattern().phases;
}

function resetBreathBodyScan() {
  _breath.bodyScan = {};
  BODY_SCAN_ITEMS.forEach(function (item) {
    _breath.bodyScan[item.id] = false;
  });
}

function renderBodyScanList(containerId) {
  var wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = BODY_SCAN_ITEMS.map(function (item) {
    var done = !!_breath.bodyScan[item.id];
    return '<label class="body-scan-item' + (done ? ' done' : '') + '">' +
      '<input type="checkbox" ' + (done ? 'checked ' : '') +
      'onchange="toggleBodyScanItem(\'' + item.id + '\', this.checked, \'' + containerId + '\')">' +
      '<span class="body-scan-check" aria-hidden="true">' + (done ? '✓' : '') + '</span>' +
      '<span class="body-scan-text"><strong>' + escapeBreathHtml(item.label) + '</strong>' +
      '<span class="body-scan-hint">' + escapeBreathHtml(item.hint) + '</span></span></label>';
  }).join('');
}

function toggleBodyScanItem(id, checked, containerId) {
  _breath.bodyScan[id] = !!checked;
  renderBodyScanList(containerId || 'breath-body-scan');
  var overlayList = document.getElementById('breath-overlay-body-scan');
  if (overlayList && overlayList.id !== containerId) renderBodyScanList('breath-overlay-body-scan');
}

function escapeBreathHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function clearBreathTimer() {
  if (_breath.timer) {
    clearInterval(_breath.timer);
    _breath.timer = null;
  }
  if (typeof S !== 'undefined' && S.breathTimer) {
    clearInterval(S.breathTimer);
    S.breathTimer = null;
  }
}

function updateBreathPhaseUI(idx, elapsed, prefix) {
  prefix = prefix || '';
  var phases = getBreathPhases();
  var pat = getBreathPattern();
  var ph = phases[idx];
  var msgEl = document.getElementById(prefix + 'breath-msg');
  var phaseEl = document.getElementById(prefix + 'breath-phase-label');
  var subEl = document.getElementById(prefix + 'breath-sub');
  var countEl = document.getElementById(prefix + 'breath-countdown');
  var titleEl = document.getElementById(prefix + 'breath-title');
  if (msgEl) {
    msgEl.style.opacity = '0';
    setTimeout(function () {
      msgEl.textContent = ph.msg;
      msgEl.style.opacity = '1';
    }, 180);
  } else if (msgEl) msgEl.textContent = ph.msg;
  if (phaseEl) phaseEl.textContent = ph.label + ' ' + ph.dur + '秒';
  if (subEl) subEl.textContent = pat.subtitle;
  if (titleEl) titleEl.textContent = pat.label;
  if (countEl) countEl.textContent = Math.max(0, ph.dur - elapsed);

  var ringSel = prefix
    ? '#breath-overlay-rings .breath-ring'
    : '#breath-screen-rings .breath-ring';
  var rings = document.querySelectorAll(ringSel);
  if (!rings.length) rings = document.querySelectorAll('.breath-ring');
  var dur = ph.dur + 's';
  rings.forEach(function (r, i) {
    r.style.animationDuration = dur;
    r.style.animationDelay = (i * 0.12) + 's';
    r.classList.remove('breath-expand', 'breath-contract', 'breath-hold');
    if (ph.ring === 'expand') r.classList.add('breath-expand');
    else if (ph.ring === 'contract') r.classList.add('breath-contract');
    else r.classList.add('breath-hold');
  });

  var scanWrap = document.getElementById('breath-overlay-body-scan-wrap');
  if (scanWrap) scanWrap.style.display = _breath.showBodyScan ? 'block' : 'none';
}

function tickBreathing(prefix, onDone) {
  _breath.elapsed++;
  _breath.phaseElapsed++;
  var remaining = _breath.totalSecs - _breath.elapsed;
  var timerEl = document.getElementById(prefix + 'breath-timer');
  if (timerEl) timerEl.textContent = Math.max(0, remaining);

  var phases = getBreathPhases();
  var ph = phases[_breath.phaseIdx];
  if (_breath.phaseElapsed >= ph.dur) {
    _breath.phaseIdx = (_breath.phaseIdx + 1) % phases.length;
    _breath.phaseElapsed = 0;
  }
  updateBreathPhaseUI(_breath.phaseIdx, _breath.phaseElapsed, prefix);

  if (_breath.elapsed >= _breath.totalSecs) {
    clearBreathTimer();
    if (typeof onDone === 'function') onDone();
  }
}

function finishBreathing() {
  var fn = _breath.onComplete;
  _breath.onComplete = null;
  if (_breath.mode === 'overlay') {
    hideBreathingOverlay(true);
    if (fn) fn();
    else if (typeof showToast === 'function') showToast('呼吸練習完成，你做得很好 🌿');
    return;
  }
  if (fn) fn();
  else if (typeof startChat === 'function') startChat();
}

function skipBreath() {
  clearBreathTimer();
  finishBreathing();
}

function startGuidedBreathing(opts) {
  opts = opts || {};
  if (opts.mode === 'overlay' || (typeof CUR_SCREEN !== 'undefined' && CUR_SCREEN === 'chat')) {
    openBreathingOverlay(opts);
    return;
  }
  startBreathing(opts);
}

/** 全螢幕呼吸（打卡後自動進入） */
function startBreathing(opts) {
  opts = opts || {};
  if (opts.mode === 'overlay') {
    openBreathingOverlay(opts);
    return;
  }
  clearBreathTimer();
  _breath.pattern = opts.pattern || 'box';
  _breath.showBodyScan = opts.showBodyScan !== false;
  resetBreathBodyScan();
  _breath.mode = 'screen';
  _breath.onComplete = opts.onComplete || null;
  var pat = getBreathPattern();
  _breath.totalSecs = opts.totalSecs || pat.defaultTotal;
  _breath.elapsed = 0;
  _breath.phaseIdx = 0;
  _breath.phaseElapsed = 0;

  var timerEl = document.getElementById('breath-timer');
  if (timerEl) timerEl.textContent = _breath.totalSecs;
  updateBreathPhaseUI(0, 0, '');
  renderBodyScanList('breath-body-scan');

  if (typeof showScreen === 'function') showScreen('breath-screen');
  _breath.timer = setInterval(function () {
    tickBreathing('', finishBreathing);
  }, 1000);
  if (typeof S !== 'undefined') S.breathTimer = _breath.timer;
}

function showBreathOverlayWithFade() {
  var overlay = document.getElementById('breath-overlay');
  if (!overlay) return;
  overlay.classList.remove('breath-overlay-hiding');
  overlay.classList.add('show');
  document.body.classList.add('breath-overlay-active');
  requestAnimationFrame(function () {
    overlay.classList.add('breath-overlay-showing');
  });
}

/** Overlay 模式 — 不離開對話，支援淡入淡出 */
function openBreathingOverlay(opts) {
  opts = opts || {};
  clearBreathTimer();
  _breath.pattern = opts.pattern || 'box';
  _breath.showBodyScan = !!opts.showBodyScan;
  resetBreathBodyScan();
  _breath.mode = 'overlay';
  _breath.onComplete = opts.onComplete || null;
  var pat = getBreathPattern();
  _breath.totalSecs = opts.totalSecs || pat.defaultTotal;
  _breath.elapsed = 0;
  _breath.phaseIdx = 0;
  _breath.phaseElapsed = 0;

  var overlay = document.getElementById('breath-overlay');
  if (!overlay) return;
  var timerEl = document.getElementById('overlay-breath-timer');
  if (timerEl) timerEl.textContent = _breath.totalSecs;
  updateBreathPhaseUI(0, 0, 'overlay-');
  if (_breath.showBodyScan) renderBodyScanList('breath-overlay-body-scan');

  if (opts.fade) showBreathOverlayWithFade();
  else {
    overlay.classList.add('show');
    document.body.classList.add('breath-overlay-active');
  }

  _breath.timer = setInterval(function () {
    tickBreathing('overlay-', finishBreathing);
  }, 1000);
}

function hideBreathingOverlay(animated) {
  clearBreathTimer();
  _breath.onComplete = null;
  var overlay = document.getElementById('breath-overlay');
  if (!overlay) return;
  if (animated) {
    overlay.classList.remove('breath-overlay-showing');
    overlay.classList.add('breath-overlay-hiding');
    setTimeout(function () {
      overlay.classList.remove('show', 'breath-overlay-hiding');
      document.body.classList.remove('breath-overlay-active');
    }, 420);
  } else {
    overlay.classList.remove('show', 'breath-overlay-showing', 'breath-overlay-hiding');
    document.body.classList.remove('breath-overlay-active');
  }
}

function openBreathingFromSOS() {
  if (typeof hideOverlay === 'function') hideOverlay('sos-modal');
  openBreathingOverlay({ pattern: 'box', showBodyScan: true, fade: true });
}
