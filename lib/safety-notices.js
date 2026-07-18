/**
 * 醫療免責＋安全提示（性侵／性騷／霸凌／家暴）
 * Gemini 風格置中 modal；依 session 頻率控制
 */
var MEDICAL_DISCLAIMER_COPY = {
  title: '重要提醒',
  body:
    '本系統僅提供情緒支持與一般性參考建議，不涉及醫療診斷、處方或治療指示，也不能取代醫師、心理師或其他專業人員的評估。\n\n' +
    '若你有身體不適、情緒嚴重影響生活、出現自傷／傷人想法，或需要診斷與治療，請儘速尋求相關專業協助或就醫（例如：附近醫療院所、身心科／精神科、學校輔導室、或撥打當地緊急／安心專線）。\n\n' +
    '你的安全與健康最重要。',
  confirm_label: '我知道了'
};

var SAFETY_NOTICE_COPY = {
  sexual_assault: {
    title: '你值得被保護',
    body:
      '你提到的情況，可能已涉及性侵害或嚴重的人身侵害。這不是你的錯，你不需要獨自面對。\n\n' +
      '如果需要，可以立即尋求協助：\n' +
      '• 撥打 113 保護專線\n' +
      '• 聯繫信任的成人、學校輔導老師或性平窗口\n' +
      '• 若處於危險或需要緊急處理，請撥打 110，必要時儘速就醫\n\n' +
      '本系統會陪你整理感受，但無法取代保護服務與專業介入。',
    confirm_label: '我知道了',
    resources: [
      { name: '113 保護專線', detail: '家暴／性侵／兒少保護' },
      { name: '110', detail: '緊急報警' },
      { name: '學校輔導／性平窗口', detail: '校園內求助' }
    ]
  },
  sexual_harassment: {
    title: '這可能已涉及性騷擾',
    body:
      '你描述的情形，可能已涉及性騷擾或不適當的侵害界限行為。你的感受很重要，你有權利被尊重與保護。\n\n' +
      '如果需要，可以尋求：\n' +
      '• 113 保護專線\n' +
      '• 學校／職場性平或輔導窗口\n' +
      '• 信任的師長、家人或同事協助記錄與申訴\n' +
      '• 情況緊急時撥打 110\n\n' +
      '你不必獨自扛著，願意說出來已經很不容易。',
    confirm_label: '我知道了',
    resources: [
      { name: '113 保護專線', detail: '家暴／性侵／兒少保護' },
      { name: '110', detail: '緊急報警' },
      { name: '學校輔導／性平窗口', detail: '校園內求助' }
    ]
  },
  bullying: {
    title: '這可能已涉及霸凌',
    body:
      '你提到的情況，可能已涉及霸凌（言語、肢體、關係或網路欺凌）。長期被這樣對待不是「你太敏感」，而是需要被看見與協助的事。\n\n' +
      '如果需要，可以尋求：\n' +
      '• 導師、輔導老師或學校相關窗口\n' +
      '• 113 保護專線\n' +
      '• 信任的家人或成人陪你一起處理\n' +
      '• 若有人身安全疑慮，撥打 110\n\n' +
      '本系統可以陪你說話，但實際保護與介入需要真人支持網絡。',
    confirm_label: '我知道了',
    resources: [
      { name: '113 保護專線', detail: '家暴／性侵／兒少保護' },
      { name: '110', detail: '緊急報警' },
      { name: '學校輔導／性平窗口', detail: '校園內求助' }
    ]
  },
  domestic_violence: {
    title: '這可能已涉及家庭暴力',
    body:
      '你提到的家庭情況，可能已涉及家庭暴力或不安全的對待。你的安全最優先，這不是你該忍受的事。\n\n' +
      '如果需要，可以尋求：\n' +
      '• 113 保護專線（家暴／性侵／兒少保護）\n' +
      '• 各地家庭暴力防治中心\n' +
      '• 信任的親友、老師協助\n' +
      '• 若正處於危險，請先離開危險處並撥打 110\n\n' +
      '請以自身安全為先；本系統無法進行緊急救援。',
    confirm_label: '我知道了',
    resources: [
      { name: '113 保護專線', detail: '家暴／性侵／兒少保護' },
      { name: '110', detail: '緊急報警' },
      { name: '家庭暴力防治中心', detail: '各地家防中心' }
    ]
  }
};

var SAFETY_DETECT = {
  medical: ['診斷', '治療', '藥物', '停藥', '劑量', '憂鬱症', '焦慮症', '精神科', '心理疾病', '服藥', '看診', '精神科醫師', '開藥', '確診', '處方', '抗憂鬱', '鎮定劑', '檢驗報告'],
  sexual_assault: ['性侵', '性侵害', '被強暴', '強制猥褻', '非自願', '被強迫發生關係', '被性侵'],
  sexual_harassment: ['性騷', '性騷擾', '不適當觸碰', '性暗示', '被拍私密', '傳私密影像', '偷拍', '性相關玩笑'],
  bullying: ['霸凌', '被欺負', '排擠', '網路霸凌', '言語欺凌', '肢體欺凌', '被孤立', '被嘲弄', '被威脅'],
  domestic_violence: ['家暴', '家人打', '被爸打', '被媽打', '家裡打人', '家庭暴力', '不安全的家', '被家人威脅']
};

var SAFETY_SEVERITY = {
  bullying: 1,
  sexual_harassment: 2,
  domestic_violence: 3,
  sexual_assault: 4
};

function getSafetySessionState() {
  if (typeof S === 'undefined') {
    return {
      medical_disclaimer_shown_this_session: false,
      safety_notice_shown: {}
    };
  }
  if (!S._safetySession) {
    S._safetySession = {
      medical_disclaimer_shown_this_session: false,
      safety_notice_shown: {}
    };
  }
  if (!S._safetySession.safety_notice_shown) S._safetySession.safety_notice_shown = {};
  return S._safetySession;
}

function resetSafetySessionState() {
  if (typeof S === 'undefined') return;
  S._safetySession = {
    medical_disclaimer_shown_this_session: false,
    safety_notice_shown: {}
  };
  S._noticeQueue = [];
}

function detectSafetyCategories(text) {
  var t = String(text || '');
  var found = [];
  Object.keys(SAFETY_DETECT).forEach(function (cat) {
    var kws = SAFETY_DETECT[cat];
    for (var i = 0; i < kws.length; i++) {
      if (t.indexOf(kws[i]) >= 0) {
        found.push(cat);
        break;
      }
    }
  });
  return found;
}

function pickHighestSafetyCategory(categories) {
  var best = null;
  var bestScore = -1;
  (categories || []).forEach(function (c) {
    if (c === 'medical') return;
    var score = SAFETY_SEVERITY[c] || 0;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  });
  return best;
}

function escapeNoticeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatNoticeBodyHtml(body) {
  return escapeNoticeHtml(body).replace(/\n/g, '<br>');
}

function renderResourcesHtml(resources) {
  if (!resources || !resources.length) return '';
  return '<ul class="notice-resource-list">' + resources.map(function (r) {
    return '<li><strong>' + escapeNoticeHtml(r.name) + '</strong>' +
      (r.detail ? '<span> — ' + escapeNoticeHtml(r.detail) + '</span>' : '') + '</li>';
  }).join('') + '</ul>';
}

function ensureNoticeQueue() {
  if (typeof S === 'undefined') return [];
  if (!S._noticeQueue) S._noticeQueue = [];
  return S._noticeQueue;
}

function enqueueNoticeModal(kind, payload) {
  var q = ensureNoticeQueue();
  q.push({ kind: kind, payload: payload || {} });
  if (!S._noticeShowing) drainNoticeQueue();
}

function drainNoticeQueue() {
  var q = ensureNoticeQueue();
  if (!q.length) {
    if (typeof S !== 'undefined') S._noticeShowing = false;
    return;
  }
  if (typeof S !== 'undefined') S._noticeShowing = true;
  var next = q.shift();
  if (next.kind === 'safety') showSafetyNoticeModal(next.payload);
  else if (next.kind === 'medical') showMedicalDisclaimerModal(next.payload);
  else {
    if (typeof S !== 'undefined') S._noticeShowing = false;
    drainNoticeQueue();
  }
}

function showMedicalDisclaimerModal(data) {
  var st = getSafetySessionState();
  if (st.medical_disclaimer_shown_this_session) {
    if (typeof S !== 'undefined') S._noticeShowing = false;
    drainNoticeQueue();
    return;
  }
  var copy = data && data.title ? data : MEDICAL_DISCLAIMER_COPY;
  var titleEl = document.getElementById('notice-modal-title');
  var bodyEl = document.getElementById('notice-modal-body');
  var btnEl = document.getElementById('notice-modal-confirm');
  var resEl = document.getElementById('notice-modal-resources');
  if (titleEl) titleEl.textContent = copy.title || MEDICAL_DISCLAIMER_COPY.title;
  if (bodyEl) bodyEl.innerHTML = formatNoticeBodyHtml(copy.body || MEDICAL_DISCLAIMER_COPY.body);
  if (resEl) resEl.innerHTML = '';
  if (btnEl) btnEl.textContent = copy.confirm_label || MEDICAL_DISCLAIMER_COPY.confirm_label;
  S._noticeActiveKind = 'medical';
  st.medical_disclaimer_shown_this_session = true;
  if (typeof showOverlay === 'function') showOverlay('policy-notice-modal');
}

function showSafetyNoticeModal(data) {
  var cat = (data && data.category) || 'bullying';
  var st = getSafetySessionState();
  if (st.safety_notice_shown[cat]) {
    if (typeof S !== 'undefined') S._noticeShowing = false;
    drainNoticeQueue();
    return;
  }
  var fallback = SAFETY_NOTICE_COPY[cat] || SAFETY_NOTICE_COPY.bullying;
  var title = (data && data.title) || fallback.title;
  var body = (data && data.body) || fallback.body;
  var label = (data && data.confirm_label) || fallback.confirm_label;
  var resources = (data && data.resources && data.resources.length) ? data.resources : fallback.resources;
  var titleEl = document.getElementById('notice-modal-title');
  var bodyEl = document.getElementById('notice-modal-body');
  var btnEl = document.getElementById('notice-modal-confirm');
  var resEl = document.getElementById('notice-modal-resources');
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = formatNoticeBodyHtml(body);
  if (resEl) resEl.innerHTML = renderResourcesHtml(resources);
  if (btnEl) btnEl.textContent = label || '我知道了';
  S._noticeActiveKind = 'safety';
  S._noticeActiveCategory = cat;
  st.safety_notice_shown[cat] = true;
  if (typeof showOverlay === 'function') showOverlay('policy-notice-modal');
}

function closePolicyNoticeModal() {
  if (typeof hideOverlay === 'function') hideOverlay('policy-notice-modal');
  if (typeof S !== 'undefined') S._noticeShowing = false;
  drainNoticeQueue();
}

/**
 * 依使用者訊息與／或 API JSON 決定是否彈窗
 * 安全提示優先於醫療免責
 */
function processPolicyNoticesFromTurn(userText, apiData) {
  var st = getSafetySessionState();
  var cats = [];
  if (apiData && Array.isArray(apiData.categories_detected)) {
    cats = apiData.categories_detected.slice();
  }
  detectSafetyCategories(userText).forEach(function (c) {
    if (cats.indexOf(c) < 0) cats.push(c);
  });

  var showSafety = false;
  var safetyPayload = null;
  var safetyCat = pickHighestSafetyCategory(cats);

  if (apiData && apiData.show_safety_notice && apiData.safety_notice) {
    safetyCat = pickHighestSafetyCategory(cats) || safetyCat || 'bullying';
    if (!st.safety_notice_shown[safetyCat]) {
      showSafety = true;
      safetyPayload = Object.assign({ category: safetyCat }, apiData.safety_notice);
    }
  } else if (safetyCat && !st.safety_notice_shown[safetyCat]) {
    showSafety = true;
    safetyPayload = Object.assign({ category: safetyCat }, SAFETY_NOTICE_COPY[safetyCat] || {});
  }

  var showMedical = false;
  var medicalPayload = null;
  var wantsMedical =
    (apiData && apiData.show_medical_disclaimer) ||
    cats.indexOf('medical') >= 0;

  if (wantsMedical && !st.medical_disclaimer_shown_this_session) {
    showMedical = true;
    medicalPayload =
      apiData && apiData.medical_disclaimer && apiData.medical_disclaimer.title
        ? apiData.medical_disclaimer
        : MEDICAL_DISCLAIMER_COPY;
  }

  // 安全優先，再醫療
  if (showSafety) enqueueNoticeModal('safety', safetyPayload);
  if (showMedical) enqueueNoticeModal('medical', medicalPayload);

  return {
    categories: cats,
    showSafety: showSafety,
    showMedical: showMedical
  };
}

/** 本機 fallback：API 不可用時仍可依關鍵字彈窗 */
function processLocalPolicyNotices(userText) {
  return processPolicyNoticesFromTurn(userText, null);
}
