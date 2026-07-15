/**
 * SEL — Socratic 三階段引導與 Quick Reply 建議籤
 * acknowledge → inquire → reframe
 */

var SOCRATIC_STAGES = ['acknowledge', 'inquire', 'reframe'];
var SOCRATIC_STAGE_LABELS = {
  acknowledge: '接住感受',
  inquire: '探索脈絡',
  reframe: '換個角度'
};

function getUserTurnCount() {
  if (typeof S === 'undefined' || !S.messages) return 0;
  return S.messages.filter(function (m) { return m.role === 'user'; }).length;
}

/** 依 AI 回覆輪次決定當前 Socratic 階段 */
function getSocraticStage() {
  var turn = (typeof S !== 'undefined' && S.aiIdx) ? S.aiIdx : 0;
  if (turn < 1) return 'acknowledge';
  if (turn < 3) return 'inquire';
  return 'reframe';
}

function getSocraticStageForContext() {
  return getSocraticStage();
}

var QUICK_REPLY_POOL = {
  acknowledge: [
    '我現在說不出來…',
    '心裡很亂',
    '我想先靜一靜',
    '我不知道從哪說起',
    '就是有點難受'
  ],
  inquire: [
    '我覺得胸口很緊',
    '是剛剛發生的事',
    '我不確定為什麼會這樣',
    '身體先反應了',
    '事情發生在我…'
  ],
  reframe: [
    '也許還有其他角度',
    '我想先照顧自己',
    '我還需要想想',
    '如果換個方式看…',
    '我想試試看能不能好一點'
  ]
};

var QUICK_REPLY_EMO_EXTRAS = {
  焦慮: ['呼吸有點急促', '腦子停不下來'],
  難過: ['眼眶有點熱', '說著說著會想哭'],
  憤怒: ['其實也有點委屈', '火氣還沒退'],
  疲憊: ['身體很沉', '已經撐很久了']
};

function pickQuickReplies(stage, max) {
  max = max || 4;
  var pool = (QUICK_REPLY_POOL[stage] || QUICK_REPLY_POOL.acknowledge).slice();
  if (typeof S !== 'undefined' && S.emotions && S.emotions.length) {
    S.emotions.slice(0, 2).forEach(function (em) {
      var lbl = em.label || '';
      Object.keys(QUICK_REPLY_EMO_EXTRAS).forEach(function (kw) {
        if (lbl.indexOf(kw) >= 0) {
          pool = pool.concat(QUICK_REPLY_EMO_EXTRAS[kw]);
        }
      });
    });
  }
  var seen = {};
  var out = [];
  var seed = (S && S.aiIdx ? S.aiIdx : 0) + pool.length;
  for (var i = 0; i < pool.length && out.length < max; i++) {
    var idx = Math.abs((seed * 31 + i * 17) % pool.length);
    var item = pool[idx];
    if (!seen[item]) {
      seen[item] = true;
      out.push(item);
    }
  }
  while (out.length < Math.min(max, pool.length)) {
    pool.forEach(function (p) {
      if (out.length < max && out.indexOf(p) < 0) out.push(p);
    });
    break;
  }
  return out.slice(0, max);
}

function renderQuickReplies() {
  var wrap = document.getElementById('chat-quick-replies');
  if (!wrap) return;
  if (typeof S !== 'undefined' && (S.isCrisisTriggered || S.isConcernPaused)) {
    wrap.style.display = 'none';
    return;
  }
  var stage = getSocraticStage();
  var chips = pickQuickReplies(stage, 4);
  var stageLbl = SOCRATIC_STAGE_LABELS[stage] || '';
  wrap.innerHTML =
    '<p class="qr-hint"><span class="qr-stage-badge">' + escapeQrHtml(stageLbl) + '</span>點選快速回覆，或自行輸入</p>' +
    '<div class="qr-chips">' + chips.map(function (txt) {
      return '<button type="button" class="qr-chip" data-t="'+escapeQrAttr(txt)+'" onclick="applyQuickReply(this.getAttribute(\'data-t\'))">' +
        escapeQrHtml(txt) + '</button>';
    }).join('') + '</div>';
  wrap.style.display = 'block';
}

function escapeQrHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeQrAttr(s) {
  return escapeQrHtml(s).replace(/"/g, '&quot;');
}

function applyQuickReply(text) {
  if (typeof S !== 'undefined' && (S.isCrisisTriggered || S.isConcernPaused)) return;
  if (!text) return;
  if (typeof sendMsg === 'function') sendMsg(text);
}

/** 離線諮商回覆：依 Socratic 階段組裝 */
function buildSocraticInquireQuestion(theme, userTxt) {
  var bodyQs = [
    '這份感受，身體上是落在哪裡？胸口、胃，還是肩膀？',
    '事情發生之前，你記得最清楚的是哪個畫面？',
    '如果回想剛才，最先浮現的是哪個細節？'
  ];
  var ctxQs = [
    '這件事裡，最讓你過不去的是哪一部分？',
    '除了現在說的，還有什麼是還沒說出口的？',
    '當時現場還有誰？發生了什麼？'
  ];
  var pool = userTxt.length < 12 ? bodyQs : ctxQs;
  if (theme && theme.nudge && theme.nudge.length) {
    return theme.nudge[Math.abs((S.aiIdx || 0)) % theme.nudge.length];
  }
  return pool[Math.abs((S.aiIdx || 0) + userTxt.length) % pool.length];
}

function buildSocraticReframeQuestion(theme, userTxt) {
  var qs = [
    '如果先不追究對錯，這件事裡有沒有一個小地方，是你還能為自己做的？',
    '把時間快轉到一週後，你希望那時的自己怎麼看待今天？',
    '若你最好的朋友遇到同樣的事，你會怎麼陪他？那對你有什麼啟發？',
    '有沒有可能，這件事還有另一個你還沒看見的角度？'
  ];
  return qs[Math.abs((S.aiIdx || 0) + userTxt.length) % qs.length];
}
