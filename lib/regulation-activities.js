/**
 * 對話中的調節活動偵測、按鈕與引導啟動
 */
var REGULATION_ACTIVITY_DEFS = [
  {
    id: 'breath_478',
    label: '4-7-8 呼吸',
    btnLabel: '好的，帶我做 4-7-8 呼吸',
    icon: '🌬️',
    match: [/4-7-8\s*呼吸/, /吸氣\s*4\s*秒.*屏息\s*7\s*秒.*吐氣\s*8\s*秒/]
  },
  {
    id: 'breath_box',
    label: '方塊呼吸',
    btnLabel: '好的，開始方塊呼吸',
    icon: '◻️',
    match: [/方塊呼吸/, /吸4.*屏4.*吐4/]
  },
  {
    id: 'pmr',
    label: '漸進式肌肉放鬆',
    btnLabel: '好的，帶我放鬆身體',
    icon: '🧘',
    match: [/漸進式肌肉放鬆/, /緊繃\s*5\s*秒.*放鬆/]
  },
  {
    id: 'movement',
    label: '輕度律動',
    btnLabel: '好的，看一下建議',
    icon: '🚶',
    match: [/快走、伸展或瑜珈/, /輕度律動/, /讓身體動一動/]
  }
];

function detectRegulationActivity(text) {
  var t = String(text || '');
  if (!t) return null;
  for (var i = 0; i < REGULATION_ACTIVITY_DEFS.length; i++) {
    var def = REGULATION_ACTIVITY_DEFS[i];
    for (var j = 0; j < def.match.length; j++) {
      if (def.match[j].test(t)) {
        return { id: def.id, label: def.label, btnLabel: def.btnLabel, icon: def.icon };
      }
    }
  }
  return null;
}

function attachActivityOfferToMessage(msg) {
  if (!msg || msg.role !== 'ai' || !msg.text) return msg;
  var offer = detectRegulationActivity(msg.text);
  if (offer) msg.activityOffer = offer;
  return msg;
}

function renderActivityOfferHtml(msg, msgIndex) {
  if (!msg.activityOffer || msg.activityDismissed || msg.activityAccepted) return '';
  var o = msg.activityOffer;
  return '<div class="activity-offer" data-msg-idx="' + msgIndex + '">' +
    '<p class="activity-offer-hint">要不要現在試試看？</p>' +
    '<div class="activity-offer-btns">' +
      '<button type="button" class="bp activity-accept-btn" onclick="acceptActivityOffer(' + msgIndex + ')">' +
        escapeRegHtml(o.icon) + ' ' + escapeRegHtml(o.btnLabel) +
      '</button>' +
      '<button type="button" class="bg activity-dismiss-btn" onclick="dismissActivityOffer(' + msgIndex + ')">先不要</button>' +
    '</div></div>';
}

function escapeRegHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function acceptActivityOffer(msgIndex) {
  if (typeof S === 'undefined' || !S.messages[msgIndex]) return;
  var msg = S.messages[msgIndex];
  if (!msg.activityOffer) return;
  msg.activityAccepted = true;
  if (typeof renderChat === 'function') renderChat();
  launchRegulationActivity(msg.activityOffer.id);
}

function dismissActivityOffer(msgIndex) {
  if (typeof S === 'undefined' || !S.messages[msgIndex]) return;
  S.messages[msgIndex].activityDismissed = true;
  if (typeof renderChat === 'function') renderChat();
  if (typeof showToast === 'function') showToast('沒問題，需要的時候再跟我說');
}

function launchRegulationActivity(activityId) {
  if (activityId === 'breath_478' && typeof startGuidedBreathing === 'function') {
    startGuidedBreathing({ pattern: '478', mode: 'overlay', fade: true });
    return;
  }
  if (activityId === 'breath_box' && typeof startGuidedBreathing === 'function') {
    startGuidedBreathing({ pattern: 'box', mode: 'overlay', fade: true, showBodyScan: true });
    return;
  }
  if (activityId === 'pmr' && typeof openPmrGuide === 'function') {
    openPmrGuide();
    return;
  }
  if (activityId === 'movement' && typeof openMovementGuide === 'function') {
    openMovementGuide();
    return;
  }
}

/* ── 漸進式肌肉放鬆引導 ── */
var PMR_STEPS = [
  { part: '腳趾', tense: '用力蜷曲腳趾', relax: '慢慢放鬆，感受腳底變輕' },
  { part: '小腿', tense: '繃緊小腿肌肉', relax: '放鬆，讓重量沉入地面' },
  { part: '大腿', tense: '收緊大腿', relax: '釋放緊繃，腿變得柔軟' },
  { part: '腹部', tense: '輕輕收緊腹部', relax: '讓腹部自然起伏' },
  { part: '雙手', tense: '握拳 5 秒', relax: '鬆開手指，手心微暖' },
  { part: '肩膀', tense: '聳起肩膀', relax: '讓肩膀自然下垂' },
  { part: '臉部', tense: '皺眉、咬緊牙關', relax: '放鬆眉心與下巴' }
];

var _pmr = { step: 0, phase: 'intro', timer: null };

function openPmrGuide() {
  _pmr.step = 0;
  _pmr.phase = 'intro';
  showRegulationGuideOverlay('pmr');
  renderPmrGuideContent();
}

function renderPmrGuideContent() {
  var root = document.getElementById('reg-guide-body');
  if (!root) return;
  var html = '';
  if (_pmr.phase === 'intro') {
    html = '<div class="reg-guide-step reg-guide-fade-in">' +
      '<p class="reg-guide-emoji">🧘</p>' +
      '<h3 class="reg-guide-title">漸進式肌肉放鬆</h3>' +
      '<p class="reg-guide-desc">我們會從腳趾到臉部，每個部位「緊繃 5 秒 → 放鬆」。請找一個可以安坐或躺下的位置。</p>' +
      '<button type="button" class="bp w100" onclick="startPmrSteps()">開始引導</button>' +
    '</div>';
  } else if (_pmr.phase === 'tense') {
    var s = PMR_STEPS[_pmr.step];
    html = '<div class="reg-guide-step reg-guide-fade-in" key="t-' + _pmr.step + '">' +
      '<p class="reg-guide-step-num">' + (_pmr.step + 1) + ' / ' + PMR_STEPS.length + ' · ' + escapeRegHtml(s.part) + '</p>' +
      '<p class="reg-guide-emoji">💪</p>' +
      '<h3 class="reg-guide-title">緊繃 5 秒</h3>' +
      '<p class="reg-guide-desc">' + escapeRegHtml(s.tense) + '</p>' +
      '<div class="reg-guide-countdown" id="pmr-countdown">5</div>' +
    '</div>';
  } else if (_pmr.phase === 'relax') {
    var s2 = PMR_STEPS[_pmr.step];
    html = '<div class="reg-guide-step reg-guide-fade-in" key="r-' + _pmr.step + '">' +
      '<p class="reg-guide-step-num">' + (_pmr.step + 1) + ' / ' + PMR_STEPS.length + '</p>' +
      '<p class="reg-guide-emoji">🌿</p>' +
      '<h3 class="reg-guide-title">放鬆</h3>' +
      '<p class="reg-guide-desc">' + escapeRegHtml(s2.relax) + '</p>' +
      '<button type="button" class="bp w100 mt12" onclick="nextPmrStep()">' +
        (_pmr.step < PMR_STEPS.length - 1 ? '下一個部位' : '完成練習') +
      '</button>' +
    '</div>';
  } else if (_pmr.phase === 'done') {
    html = '<div class="reg-guide-step reg-guide-fade-in">' +
      '<p class="reg-guide-emoji">✨</p>' +
      '<h3 class="reg-guide-title">做得很棒</h3>' +
      '<p class="reg-guide-desc">身體的緊繃慢慢鬆開了。若願意，可以帶著這份輕鬆回到對話。</p>' +
      '<button type="button" class="bp w100" onclick="closeRegulationGuideOverlay()">回到對話</button>' +
    '</div>';
  }
  root.innerHTML = html;
  if (_pmr.phase === 'tense') startPmrTenseTimer();
}

function startPmrSteps() {
  _pmr.step = 0;
  _pmr.phase = 'tense';
  crossfadeRegGuide(renderPmrGuideContent);
}

function startPmrTenseTimer() {
  clearInterval(_pmr.timer);
  var left = 5;
  var el = document.getElementById('pmr-countdown');
  if (el) el.textContent = left;
  _pmr.timer = setInterval(function () {
    left--;
    if (el) el.textContent = Math.max(0, left);
    if (left <= 0) {
      clearInterval(_pmr.timer);
      _pmr.phase = 'relax';
      crossfadeRegGuide(renderPmrGuideContent);
    }
  }, 1000);
}

function nextPmrStep() {
  if (_pmr.step < PMR_STEPS.length - 1) {
    _pmr.step++;
    _pmr.phase = 'tense';
    crossfadeRegGuide(renderPmrGuideContent);
  } else {
    _pmr.phase = 'done';
    crossfadeRegGuide(renderPmrGuideContent);
  }
}

/* ── 輕度律動建議卡 ── */
function openMovementGuide() {
  showRegulationGuideOverlay('movement');
  var root = document.getElementById('reg-guide-body');
  if (!root) return;
  root.innerHTML = '<div class="reg-guide-step reg-guide-fade-in">' +
    '<p class="reg-guide-emoji">🚶</p>' +
    '<h3 class="reg-guide-title">輕度律動建議</h3>' +
    '<ul class="reg-guide-list">' +
      '<li><strong>快走 5 分鐘</strong>——在走廊或戶外緩慢走動，感受腳步節奏</li>' +
      '<li><strong>肩頸伸展</strong>——左右轉頭、聳肩再放鬆，各重複 3 次</li>' +
      '<li><strong>站立伸展</strong>——雙手向上延伸，輕輕側彎，不用勉強</li>' +
    '</ul>' +
    '<p class="reg-guide-desc">不必很激烈，只要讓身體稍微動一動，幫助神經系統切換節奏。</p>' +
    '<button type="button" class="bp w100" onclick="closeRegulationGuideOverlay()">我了解了</button>' +
  '</div>';
}

/* ── 通用引導 overlay（淡入淡出）── */
function showRegulationGuideOverlay(kind) {
  var overlay = document.getElementById('regulation-guide-overlay');
  if (!overlay) return;
  overlay.setAttribute('data-kind', kind || '');
  overlay.classList.remove('reg-guide-hiding');
  overlay.classList.add('show');
  document.body.classList.add('reg-guide-active');
  requestAnimationFrame(function () {
    overlay.classList.add('reg-guide-showing');
  });
}

function closeRegulationGuideOverlay() {
  var overlay = document.getElementById('regulation-guide-overlay');
  if (!overlay) return;
  clearInterval(_pmr.timer);
  overlay.classList.remove('reg-guide-showing');
  overlay.classList.add('reg-guide-hiding');
  setTimeout(function () {
    overlay.classList.remove('show', 'reg-guide-hiding');
    document.body.classList.remove('reg-guide-active');
    var body = document.getElementById('reg-guide-body');
    if (body) body.innerHTML = '';
    if (typeof showToast === 'function') showToast('引導結束，你做得很好 🌿');
  }, 420);
}

function crossfadeRegGuide(renderFn) {
  var body = document.getElementById('reg-guide-body');
  if (!body) { if (renderFn) renderFn(); return; }
  body.classList.add('reg-guide-body-fade-out');
  setTimeout(function () {
    body.classList.remove('reg-guide-body-fade-out');
    if (renderFn) renderFn();
    body.classList.add('reg-guide-body-fade-in');
    setTimeout(function () { body.classList.remove('reg-guide-body-fade-in'); }, 380);
  }, 280);
}
