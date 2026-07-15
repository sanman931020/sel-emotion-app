/**
 * SEL — 危機偵測與對話凍結
 * crisis：自傷／輕生 → 凍結對話 + 支援 Modal
 * concern：霸凌／暴力等 → 支援 Modal + 可選擇繼續對話（不凍結）
 */
var CRISIS_KEYWORDS = [
  '自殘', '自傷', '輕生', '想死', '不想活', '想消失', '活著沒意義', '沒人在乎',
  '結束生命', '了結自己', '自殺', '結束一切', '不想活了', '活不下去', '了結生命'
];
var CONCERN_KEYWORDS = ['霸凌', '暴力', '傷害自己', '被打', '被威脅', '被欺負', '被揍'];

var _concernResumeFn = null;

function crisisScanMessage(text) {
  var t = String(text || '').trim();
  if (!t) return { level: 'none' };
  var i;
  for (i = 0; i < CRISIS_KEYWORDS.length; i++) {
    if (t.indexOf(CRISIS_KEYWORDS[i]) >= 0) {
      return { level: 'crisis', keyword: CRISIS_KEYWORDS[i] };
    }
  }
  for (i = 0; i < CONCERN_KEYWORDS.length; i++) {
    if (t.indexOf(CONCERN_KEYWORDS[i]) >= 0) {
      return { level: 'concern', keyword: CONCERN_KEYWORDS[i] };
    }
  }
  return { level: 'none' };
}

function setChatInputFrozen(frozen) {
  var inp = document.getElementById('chat-inp');
  var btn = document.getElementById('send-btn');
  var endBtn = document.querySelector('#s-chat .bo');
  if (inp) {
    inp.disabled = !!frozen;
    inp.placeholder = frozen
      ? '對話已暫停，請先透過下方資源取得支持…'
      : '在這裡說說你的感受…';
    inp.style.opacity = frozen ? '0.55' : '1';
  }
  if (btn) {
    btn.disabled = !!frozen;
    btn.style.opacity = frozen ? '0.45' : '1';
    btn.style.pointerEvents = frozen ? 'none' : 'auto';
  }
  if (endBtn && frozen) endBtn.disabled = false;
  document.body.classList.toggle('chat-crisis-frozen', !!frozen);
}

function buildCrisisHelplineHtml(limit) {
  limit = limit || 4;
  var lines = (typeof NATIONAL_RESOURCES !== 'undefined' ? NATIONAL_RESOURCES : [])
    .filter(function (r) { return r.tel; })
    .slice(0, limit);
  return lines.map(function (r) {
    var tel = (r.tel || '').replace(/[^\d]/g, '');
    return '<a class="crisis-tel-card" href="tel:' + tel + '">' +
      '<span class="crisis-tel-emoji">' + (r.emoji || '📞') + '</span>' +
      '<span><strong>' + escapeCrisisHtml(r.title) + '</strong>' +
      '<span class="crisis-tel-sub">' + escapeCrisisHtml(r.sub || '') + '</span></span>' +
      '<span class="crisis-tel-num">' + escapeCrisisHtml(r.tel) + '</span></a>';
  }).join('');
}

function buildCrisisContactHtml() {
  var contacts = (typeof S !== 'undefined' && S.contacts) ? S.contacts : [];
  var picked = contacts.filter(function (c) {
    return c && (String(c.email || '').trim() || String(c.name || '').trim());
  }).slice(0, 2);
  if (!picked.length) {
    return '<p class="f12 t3" style="line-height:1.7;margin-top:8px">可至「設定 → 暖心支持對象」新增信任聯絡人。</p>';
  }
  return picked.map(function (c) {
    var label = c.nickname || c.name || '支持對象';
    var email = String(c.email || '').trim();
    if (email) {
      return '<a class="crisis-contact-card" href="mailto:' + encodeURIComponent(email) +
        '?subject=' + encodeURIComponent('我需要支持') + '">' +
        '<span>💌</span><span><strong>' + escapeCrisisHtml(label) + '</strong>' +
        '<span class="crisis-tel-sub">' + escapeCrisisHtml(c.rel || '') + ' · ' + escapeCrisisHtml(email) + '</span></span></a>';
    }
    return '<div class="crisis-contact-card" style="cursor:default"><span>💌</span><span><strong>' +
      escapeCrisisHtml(label) + '</strong><span class="crisis-tel-sub">' + escapeCrisisHtml(c.rel || '') + '</span></span></div>';
  }).join('');
}

function escapeCrisisHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderCrisisModalContent() {
  var box = document.getElementById('crisis-modal-body');
  if (!box) return;
  box.innerHTML =
    '<p class="crisis-lead">你不需要一個人扛著。現在最重要的是你的安全，請優先聯繫可信任的人或專線。</p>' +
    '<p class="f12 fw5 t2 mb8">全國心理支持專線</p>' +
    '<div class="crisis-tel-list">' + buildCrisisHelplineHtml(4) + '</div>' +
    '<p class="f12 fw5 t2 mb8 mt16">暖心支持對象</p>' +
    buildCrisisContactHtml() +
    '<p class="f11 t3 mt14" style="line-height:1.65">本系統無法取代專業危機介入。若你有立即危險，請撥打 <strong>119</strong> 或前往最近急診。</p>';
}

function renderConcernModalContent(scan) {
  var box = document.getElementById('concern-modal-body');
  var lead = document.getElementById('concern-modal-lead');
  if (lead) {
    lead.textContent = '你提到的事可能讓人很不好受。你可以先看看支持資源，也可以選擇繼續和我說下去——兩種都可以。';
  }
  if (!box) return;
  box.innerHTML =
    '<p class="f12 t2 mb12" style="line-height:1.8">若你正處於不安全的情境，請優先確保自身安全，並考慮聯繫下方資源或信任的人。</p>' +
    '<p class="f12 fw5 t2 mb8">可撥打的專線</p>' +
    '<div class="crisis-tel-list">' + buildCrisisHelplineHtml(3) + '</div>' +
    '<p class="f12 fw5 t2 mb8 mt14">暖心支持對象</p>' +
    buildCrisisContactHtml();
}

function triggerCrisisModal() {
  if (typeof S !== 'undefined') {
    S.isCrisisTriggered = true;
    S.isConcernPaused = false;
  }
  _concernResumeFn = null;
  if (typeof hideOverlay === 'function') hideOverlay('concern-modal');
  setChatInputFrozen(true);
  renderCrisisModalContent();
  if (typeof showOverlay === 'function') showOverlay('crisis-modal');
  var qr = document.getElementById('chat-quick-replies');
  if (qr) qr.style.display = 'none';
}

/**
 * 關注層級：顯示資源 Modal，暫停 AI 回覆，由使用者決定是否繼續對話
 * @param {object} scan - crisisScanMessage 結果
 * @param {function} resumeFn - 使用者點「繼續對話」後執行（通常為 dispatchChatReply）
 */
function triggerConcernModal(scan, resumeFn) {
  if (typeof S !== 'undefined') {
    S.isConcernPaused = true;
    S.isCrisisTriggered = false;
  }
  _concernResumeFn = typeof resumeFn === 'function' ? resumeFn : null;
  setChatInputFrozen(false);
  renderConcernModalContent(scan || {});
  if (typeof showOverlay === 'function') showOverlay('concern-modal');
}

function releaseCrisisModal(continueChat) {
  if (typeof hideOverlay === 'function') hideOverlay('crisis-modal');
  if (continueChat) {
    if (typeof S !== 'undefined') {
      S.isCrisisTriggered = false;
      S.isConcernPaused = false;
    }
    setChatInputFrozen(false);
    if (typeof renderQuickReplies === 'function') renderQuickReplies();
  }
}

function releaseConcernModal() {
  if (typeof hideOverlay === 'function') hideOverlay('concern-modal');
  _concernResumeFn = null;
  if (typeof S !== 'undefined') S.isConcernPaused = false;
}

function continueConcernChat() {
  if (typeof hideOverlay === 'function') hideOverlay('concern-modal');
  if (typeof S !== 'undefined') S.isConcernPaused = false;
  var fn = _concernResumeFn;
  _concernResumeFn = null;
  if (fn) fn();
  if (typeof renderQuickReplies === 'function') renderQuickReplies();
}

function openCrisisBreathing() {
  if (typeof hideOverlay === 'function') {
    hideOverlay('crisis-modal');
    hideOverlay('concern-modal');
  }
  if (typeof CUR_SCREEN !== 'undefined' && CUR_SCREEN === 'chat' && typeof startGuidedBreathing === 'function') {
    startGuidedBreathing({ pattern: 'box', mode: 'overlay', fade: true, showBodyScan: true });
  } else if (typeof startBreathing === 'function') {
    startBreathing();
  }
}

function openConcernBreathing() {
  if (typeof hideOverlay === 'function') hideOverlay('concern-modal');
  if (typeof CUR_SCREEN !== 'undefined' && CUR_SCREEN === 'chat' && typeof startGuidedBreathing === 'function') {
    startGuidedBreathing({ pattern: 'box', mode: 'overlay', fade: true, showBodyScan: true });
  } else if (typeof startBreathing === 'function') {
    startBreathing();
  }
}
