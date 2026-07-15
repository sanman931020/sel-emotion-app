/**
 * AI 動態情緒標籤 — 從自由文字偵測情緒強度
 */
var EMOTION_TAG_RULES = [
  { kw: ['焦慮', '緊張', '擔心', '不安', '慌', '害怕', '恐慌'], ids: ['emo_anxiety', 'emo_panic', 'emo_afraid'], level: 'high' },
  { kw: ['憤怒', '生氣', '火大', '不爽', '氣死', '暴躁'], ids: ['emo_anger', 'emo_irritable', 'emo_annoyed'], level: 'high' },
  { kw: ['難過', '悲傷', '傷心', '哭', '失落', '空虛', '孤單'], ids: ['emo_sad', 'emo_lonely', 'emo_empty'], level: 'medium' },
  { kw: ['委屈', '不公平', '被誤會', '被忽視'], ids: ['emo_wronged', 'emo_unfair'], level: 'medium' },
  { kw: ['背叛', '出賣', '說出去'], ids: ['emo_betrayed', 'emo_resentment'], level: 'high' },
  { kw: ['疲憊', '累', '沒力', '倦怠', '撐不住'], ids: ['emo_exhausted', 'emo_drained'], level: 'medium' },
  { kw: ['開心', '高興', '快樂', '輕鬆', '平靜'], ids: ['emo_happy', 'emo_calm', 'emo_relaxed'], level: 'low' },
  { kw: ['嫉妒', '羨慕'], ids: ['emo_jealous'], level: 'medium' },
  { kw: ['羞愧', '丟臉', '不好意思'], ids: ['emo_shame', 'emo_ashamed_public'], level: 'medium' },
  { kw: ['麻木', '沒感覺', '放空'], ids: ['emo_numb', 'emo_apathetic'], level: 'low' }
];

var LEVEL_LABELS = { high: '高', medium: '中', low: '低' };

function detectEmotionTags(text) {
  var t = String(text || '').trim();
  if (!t) return [];
  var found = [];
  var seen = {};
  EMOTION_TAG_RULES.forEach(function (rule) {
    var hit = rule.kw.some(function (w) { return t.indexOf(w) >= 0; });
    if (!hit) return;
    rule.ids.forEach(function (id) {
      if (seen[id]) return;
      var em = typeof resolveEmotion === 'function' ? resolveEmotion(id) : null;
      if (!em && typeof SEL_INDEX !== 'undefined') {
        var tag = SEL_INDEX.emotionById[id];
        if (tag) em = { id: id, label: tag.label };
      }
      if (!em) return;
      seen[id] = true;
      found.push({
        id: id,
        label: em.label,
        level: rule.level,
        levelLabel: LEVEL_LABELS[rule.level] || '中',
        color: em.color || 'var(--acc)',
        bg: em.bg || 'var(--acc-l)'
      });
    });
  });
  return found.slice(0, 6);
}

function renderDetectedTags(containerId, tags, onApply) {
  var wrap = document.getElementById(containerId);
  if (!wrap) return;
  if (!tags || !tags.length) {
    wrap.style.display = 'none';
    wrap.innerHTML = '';
    return;
  }
  wrap.style.display = 'block';
  var chips = tags.map(function (tag) {
    return '<button type="button" class="detected-etag" style="border-color:' + tag.color + ';color:' + tag.color + ';background:' + tag.bg + '" ' +
      'onclick="' + (onApply || 'applyDetectedTag') + '(\'' + tag.id + '\')">' +
      escapeTagHtml(tag.label) + '<span class="etag-level">' + escapeTagHtml(tag.levelLabel) + '</span></button>';
  }).join('');
  wrap.innerHTML = '<p class="detected-tags-hint">偵測到的情緒 · 點選加入</p><div class="etag-grid">' + chips + '</div>';
}

function escapeTagHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function applyDetectedTag(id) {
  if (typeof S === 'undefined') return;
  if (S.emotionIds.indexOf(id) < 0) {
    S.emotionIds.push(id);
    if (typeof syncEmotionState === 'function') syncEmotionState();
    if (typeof updateAmbientGlow === 'function') updateAmbientGlow(S.emotionIds);
    if (typeof ciRender === 'function' && typeof CUR_SCREEN !== 'undefined' && CUR_SCREEN === 'checkin') ciRender();
    if (typeof showToast === 'function') showToast('已加入情緒標籤');
  }
}

function onReflectionInput(text) {
  var tags = detectEmotionTags(text);
  renderDetectedTags('ci-detected-tags', tags, 'applyDetectedTag');
}

function onVoiceInputFinal(text, targetId) {
  if (targetId === 'ci-reflection-inp') onReflectionInput(text);
  else if (targetId === 'chat-inp' && typeof detectEmotionTags === 'function') {
    var tags = detectEmotionTags(text);
    renderDetectedTags('chat-detected-tags', tags, null);
  }
}
