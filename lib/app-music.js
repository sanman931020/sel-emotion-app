/**
 * App 全域背景音樂（主頁／日記／打卡牆／對話；設定／關於）
 * 與情緒藝廊展場音樂分開；藝廊開啟時會暫停本模組。
 */
var APP_MUSIC_STORAGE_KEY = 'sel_app_music_enabled';
/* 相對藝廊音量約 35–40%（藝廊為基準 100%） */
var APP_MUSIC_VOLUME = 0.16;
var APP_MUSIC_TRACKS = {
  social: { file: 'Social awareness.mp3', label: 'Social awareness' },
  responsible: { file: 'Responsible Decision Making.mp3', label: 'Responsible Decision Making' }
};

var _appAudio = null;
var _appMusicFadeTimer = null;
var _appMusicTrackKey = null;

function isAppMusicEnabled() {
  try {
    var v = localStorage.getItem(APP_MUSIC_STORAGE_KEY);
    if (v == null) return true;
    return v !== '0' && v !== 'false';
  } catch (e) {
    return true;
  }
}

function setAppMusicEnabled(on) {
  try {
    localStorage.setItem(APP_MUSIC_STORAGE_KEY, on ? '1' : '0');
  } catch (e) {}
}

function getAppAudioEl() {
  if (!_appAudio) {
    _appAudio = new Audio();
    _appAudio.loop = true;
    _appAudio.preload = 'auto';
  }
  return _appAudio;
}

function clearAppMusicFade() {
  if (_appMusicFadeTimer) {
    clearInterval(_appMusicFadeTimer);
    _appMusicFadeTimer = null;
  }
}

function appMusicFileUrl(file) {
  return file ? encodeURI(file) : '';
}

function resolveAppMusicTrackKey() {
  var screen = typeof CUR_SCREEN !== 'undefined' ? CUR_SCREEN : '';
  if (screen === 'gallery' || screen === 'splash' || screen === 'login' ||
      screen === 'consent' || screen === 'pin-screen' || screen === 'onboard') {
    return null;
  }
  if (screen === 'checkin' || screen === 'chat' || screen === 'post' ||
      screen === 'breath-screen' || screen === 'scenario') {
    return 'social';
  }
  if (screen === 'main' && typeof S !== 'undefined') {
    if (S.curTab === 'settings' || S.curTab === 'about') return 'responsible';
    if (S.curTab === 'gallery') return null;
    return 'social';
  }
  return null;
}

function fadeOutAppMusic(ms) {
  var audio = _appAudio;
  if (!audio) return;
  clearAppMusicFade();
  ms = typeof ms === 'number' ? ms : 700;
  var startVol = audio.volume;
  if (!startVol || audio.paused) {
    audio.pause();
    return;
  }
  var steps = Math.max(8, Math.round(ms / 50));
  var i = 0;
  _appMusicFadeTimer = setInterval(function () {
    i++;
    audio.volume = Math.max(0, startVol * (1 - i / steps));
    if (i >= steps) {
      clearAppMusicFade();
      audio.pause();
      audio.volume = APP_MUSIC_VOLUME;
    }
  }, 50);
}

function startAppMusicFadeIn(trackKey) {
  var track = APP_MUSIC_TRACKS[trackKey];
  if (!track || !track.file) return;
  var audio = getAppAudioEl();
  var url = appMusicFileUrl(track.file);
  var abs = '';
  try {
    abs = new URL(url, window.location.href).href;
  } catch (e) {
    abs = url;
  }
  var sameTrack = _appMusicTrackKey === trackKey && !audio.paused && audio.src === abs;

  if (sameTrack) {
    if (audio.volume < APP_MUSIC_VOLUME * 0.9) {
      clearAppMusicFade();
      var targetKeep = APP_MUSIC_VOLUME;
      var stepKeep = targetKeep / 20;
      _appMusicFadeTimer = setInterval(function () {
        if (audio.volume + stepKeep >= targetKeep) {
          audio.volume = targetKeep;
          clearAppMusicFade();
        } else {
          audio.volume = Math.min(targetKeep, audio.volume + stepKeep);
        }
      }, 80);
    }
    return;
  }

  clearAppMusicFade();
  _appMusicTrackKey = trackKey;
  if (audio.src !== abs) {
    audio.src = url;
    try { audio.load(); } catch (e2) {}
  }
  audio.volume = 0;
  var playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      var unlock = function () {
        document.removeEventListener('pointerdown', unlock, true);
        if (isAppMusicEnabled() && resolveAppMusicTrackKey() === trackKey) {
          startAppMusicFadeIn(trackKey);
        }
      };
      document.addEventListener('pointerdown', unlock, true);
    });
  }
  var target = APP_MUSIC_VOLUME;
  var step = target / 40;
  _appMusicFadeTimer = setInterval(function () {
    if (!audio) return;
    if (audio.volume + step >= target) {
      audio.volume = target;
      clearAppMusicFade();
    } else {
      audio.volume = Math.min(target, audio.volume + step);
    }
  }, 100);
}

/** 依目前畫面／分頁同步背景音樂 */
function syncAppMusic() {
  if (!isAppMusicEnabled()) {
    fadeOutAppMusic(500);
    return;
  }
  var key = resolveAppMusicTrackKey();
  if (!key) {
    fadeOutAppMusic(700);
    return;
  }
  startAppMusicFadeIn(key);
}

function toggleAppMusic() {
  var next = !isAppMusicEnabled();
  setAppMusicEnabled(next);
  if (next) {
    syncAppMusic();
    if (typeof showToast === 'function') showToast('背景音樂已開啟');
  } else {
    fadeOutAppMusic(500);
    if (typeof showToast === 'function') showToast('背景音樂已關閉');
  }
  refreshAppMusicToggleUI();
}

function refreshAppMusicToggleUI() {
  var on = isAppMusicEnabled();
  document.querySelectorAll('.app-music-btn').forEach(function (btn) {
    btn.classList.toggle('on', on);
    btn.classList.toggle('off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? '關閉背景音樂' : '開啟背景音樂');
    btn.title = on ? '關閉背景音樂' : '開啟背景音樂';
  });
}

/** 日／夜模式開關（軌道內含小太陽／星星） */
function darkModeToggleHtml(id) {
  return '<button type="button" class="tgl tgl-dark ' + (S.dark ? 'on' : 'off') + '"' +
    (id ? ' id="' + id + '"' : '') +
    ' onclick="toggleDark()" aria-label="切換日間或夜間模式" title="日間／夜間模式">' +
    '<span class="tgl-track-sun" aria-hidden="true">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/>' +
      '<g stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none">' +
      '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>' +
      '</g></svg>' +
    '</span>' +
    '<span class="tgl-track-stars" aria-hidden="true">' +
      '<i></i><i></i><i></i>' +
    '</span>' +
    '<div class="knob"></div>' +
  '</button>';
}

/** 右上角：音樂開關 + 日夜模式 */
function headerControlsHtml(darkId) {
  var musicOn = isAppMusicEnabled();
  var musicBtn =
    '<button type="button" class="app-music-btn ' + (musicOn ? 'on' : 'off') + '" onclick="toggleAppMusic()" ' +
      'aria-pressed="' + (musicOn ? 'true' : 'false') + '" ' +
      'aria-label="' + (musicOn ? '關閉背景音樂' : '開啟背景音樂') + '" ' +
      'title="' + (musicOn ? '關閉背景音樂' : '開啟背景音樂') + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M9 18V5l12-2v13"/>' +
        '<circle cx="6" cy="18" r="3"/>' +
        '<circle cx="18" cy="16" r="3"/>' +
      '</svg>' +
      '<span class="app-music-slash" aria-hidden="true"></span>' +
    '</button>';
  return '<div class="header-controls">' + musicBtn + darkModeToggleHtml(darkId) + '</div>';
}
