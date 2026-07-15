/**
 * 語音輸入 — Web Speech API，不支援時改為模擬提示
 */
var _voice = {
  listening: false,
  recognition: null,
  targetId: 'chat-inp',
  mockMode: false
};

function voiceInputSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function initVoiceRecognition() {
  if (_voice.recognition) return _voice.recognition;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    _voice.mockMode = true;
    return null;
  }
  var rec = new SR();
  rec.lang = 'zh-TW';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.onresult = function (ev) {
    var txt = '';
    for (var i = ev.resultIndex; i < ev.results.length; i++) {
      txt += ev.results[i][0].transcript;
    }
    var el = document.getElementById(_voice.targetId);
    if (el) {
      el.value = txt;
      if (typeof autoResize === 'function') autoResize(el);
      else el.dispatchEvent(new Event('input'));
    }
    if (ev.results[ev.results.length - 1].isFinal) {
      stopVoiceInput();
      if (typeof onVoiceInputFinal === 'function') onVoiceInputFinal(txt, _voice.targetId);
    }
  };
  rec.onerror = function (ev) {
    stopVoiceInput();
    if (ev.error === 'not-allowed') {
      if (typeof showToast === 'function') showToast('請允許麥克風權限以使用語音輸入');
    } else if (_voice.mockMode || ev.error === 'network') {
      runVoiceMock();
    }
  };
  rec.onend = function () {
    if (_voice.listening) {
      try { rec.start(); } catch (e) { stopVoiceInput(); }
    }
  };
  _voice.recognition = rec;
  return rec;
}

function runVoiceMock() {
  var samples = [
    '今天心情有點亂，說不上來。',
    '我覺得很焦慮，胸口有點緊。',
    '跟朋友吵架了，心裡很委屈。',
    '壓力很大，功課做不完。'
  ];
  var txt = samples[Math.floor(Math.random() * samples.length)];
  var el = document.getElementById(_voice.targetId);
  if (el) {
    el.value = txt;
    if (typeof autoResize === 'function') autoResize(el);
    else el.dispatchEvent(new Event('input'));
  }
  if (typeof showToast === 'function') showToast('語音模擬：已填入示範文字（瀏覽器不支援語音辨識）');
  if (typeof onVoiceInputFinal === 'function') onVoiceInputFinal(txt, _voice.targetId);
}

function toggleVoiceInput(targetId) {
  if (targetId) _voice.targetId = targetId;
  if (_voice.listening) {
    stopVoiceInput();
    return;
  }
  if (!voiceInputSupported()) {
    _voice.mockMode = true;
    runVoiceMock();
    return;
  }
  var rec = initVoiceRecognition();
  if (!rec) {
    runVoiceMock();
    return;
  }
  _voice.listening = true;
  updateVoiceBtnState();
  try {
    rec.start();
    if (typeof showToast === 'function') showToast('正在聆聽… 請說出你的感受');
  } catch (e) {
    stopVoiceInput();
    runVoiceMock();
  }
}

function stopVoiceInput() {
  _voice.listening = false;
  if (_voice.recognition) {
    try { _voice.recognition.stop(); } catch (e) { /* ignore */ }
  }
  updateVoiceBtnState();
}

function updateVoiceBtnState() {
  document.querySelectorAll('.voice-btn').forEach(function (btn) {
    btn.classList.toggle('listening', _voice.listening);
    btn.setAttribute('aria-pressed', _voice.listening ? 'true' : 'false');
    var label = _voice.listening ? '停止語音輸入' : '語音輸入';
    btn.setAttribute('aria-label', label);
  });
}
