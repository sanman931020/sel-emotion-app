/**
 * 情緒藝廊 — 私人 SEL 數位展場
 * 資料來源：S.diary 心靈畫布；佈局／標籤持久化於 localStorage
 */
var GALLERY_STORAGE_KEY = 'sel_emotion_gallery_v1';
var GALLERY_MAX_SLOTS = 10;
var GALLERY_MIN_SHOW = 7;
var _galleryState = {
  curate: false,
  detailId: null,
  dragFrom: null,
  theme: 'soft',
  viewMode: 'walk' // walk | overview
};
var _galleryDocu = {
  active: false,
  tempMusic: false,
  timers: [],
  index: -1,
  pieces: [],
  reduced: false,
  magicCleanup: null
};
var _galleryViewMagicCleanup = null;

var GALLERY_THEME_ORDER = ['soft', 'rain', 'dawn', 'white', 'beige', 'black'];
var GALLERY_THEME_NAMES = {
  soft: '柔光',
  rain: '雨日',
  dawn: '清晨',
  white: '白牆',
  beige: '米色',
  black: '玄黑'
};
var GALLERY_WALL_FX_ORDER = ['none', 'glitter', 'magic', 'geo', 'stardust', 'goldshine', 'silverrings'];
var GALLERY_WALL_FX_NAMES = {
  none: '無',
  glitter: '亮粉',
  magic: '魔法',
  geo: '幾何',
  stardust: '星塵',
  goldshine: '金輝',
  silverrings: '銀環'
};

var GALLERY_FRAME_COLORS = [
  { id: 'ivory', label: '米白', hex: '#e8e2d4' },
  { id: 'gold', label: '暖金', hex: '#c4a574' },
  { id: 'walnut', label: '胡桃', hex: '#6b4f3a' },
  { id: 'ebony', label: '墨黑', hex: '#2c2c2e' },
  { id: 'silver', label: '銀灰', hex: '#a8adb8' },
  { id: 'sage', label: '鼠尾草', hex: '#7a8f7a' },
  { id: 'clay', label: '陶土', hex: '#b07a5c' },
  { id: 'sky', label: '霧藍', hex: '#7f93a8' },
  { id: 'night', label: '星夜藍', hex: '#2f4570' },
  { id: 'blush', label: '粉霧', hex: '#e8b4c4' },
  { id: 'rose', label: '玫瑰', hex: '#c4788a' },
  { id: 'lavender', label: '薰衣草', hex: '#9b8ec4' },
  { id: 'mint', label: '薄荷', hex: '#7eb8a8' },
  { id: 'copper', label: '赤銅', hex: '#a86b4a' }
];

var GALLERY_FRAME_MATERIALS = [
  { id: 'wood', label: '木紋' },
  { id: 'metal', label: '金屬' },
  { id: 'linen', label: '亞麻' },
  { id: 'matte', label: '霧面' },
  { id: 'ornate', label: '雕飾' }
];

var GALLERY_POEM_MAX = 30;

var GALLERY_MUSIC_TRACKS = [
  { id: 'none', label: '不要音樂', file: null },
  { id: 'self-awareness', label: 'Self-awareness', file: 'Self-awareness.mp3' },
  { id: 'self-management', label: 'Self-management', file: 'Self-management.mp3' },
  { id: 'social-awareness', label: 'Social awareness', file: 'Social awareness.mp3' },
  { id: 'relationship', label: 'Relationship skills', file: 'Relationship skills.mp3' },
  { id: 'responsible', label: 'Responsible Decision Making', file: 'Responsible Decision Making.mp3' }
];
var GALLERY_MUSIC_DEFAULT = 'self-management';
/* 藝廊為全站基準音量 100%；其他頁面約 60–70% */
var GALLERY_MUSIC_VOLUME = 0.42;
var _galleryAudio = null;
var _galleryMusicFadeTimer = null;

function defaultExhibition() {
  return {
    id: 'ex_default',
    title: '我的情緒藝廊',
    theme: 'soft',
    viewMode: 'walk',
    wallFx: 'none',
    musicId: GALLERY_MUSIC_DEFAULT,
    updatedAt: new Date().toISOString(),
    layout: [],
    wallTitleCards: []
  };
}

function loadGalleryStore() {
  try {
    var raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return { exhibition: defaultExhibition(), artworksMeta: {} };
    var data = JSON.parse(raw);
    if (!data.exhibition) data.exhibition = defaultExhibition();
    if (!data.artworksMeta) data.artworksMeta = {};
    if (!data.exhibition.musicId) data.exhibition.musicId = GALLERY_MUSIC_DEFAULT;
    return data;
  } catch (e) {
    return { exhibition: defaultExhibition(), artworksMeta: {} };
  }
}

function saveGalleryStore(store) {
  try {
    store.exhibition.updatedAt = new Date().toISOString();
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {}
}

function galleryDiaryCandidates() {
  if (!Array.isArray(S.diary)) return [];
  return S.diary
    .filter(function (e) {
      if (!e || !e.id) return false;
      if (e.canvasDataUrl || e.aiImageUrl) return true;
      if (e.emotionColors && e.emotionColors.length) return true;
      if (e.colors && e.colors.length) return true;
      return false;
    })
    .slice()
    .sort(function (a, b) {
      return String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || ''));
    });
}

function syncGalleryArtworks(store) {
  var candidates = galleryDiaryCandidates();
  var meta = store.artworksMeta || {};
  var pinned = candidates.filter(function (e) {
    return meta[e.id] && meta[e.id].pinned;
  }).slice(0, 3);
  var pinnedIds = {};
  pinned.forEach(function (e) { pinnedIds[e.id] = true; });
  var rest = candidates.filter(function (e) { return !pinnedIds[e.id]; });
  var selected = pinned.concat(rest).slice(0, GALLERY_MAX_SLOTS);

  // 隱藏的不進展牆
  selected = selected.filter(function (e) {
    return !(meta[e.id] && meta[e.id].hidden);
  });

  var layoutMap = {};
  (store.exhibition.layout || []).forEach(function (L) {
    if (L && L.artworkId != null) layoutMap[L.artworkId] = L;
  });

  var usedSlots = {};
  var newLayout = [];
  selected.forEach(function (e) {
    var prev = layoutMap[e.id];
    var slot = prev && typeof prev.slotIndex === 'number' ? prev.slotIndex : -1;
    if (slot < 0 || slot >= GALLERY_MAX_SLOTS || usedSlots[slot]) slot = -1;
    if (slot >= 0) usedSlots[slot] = true;
    newLayout.push({
      artworkId: e.id,
      slotIndex: slot,
      offsetX: prev && prev.offsetX || 0,
      offsetY: prev && prev.offsetY || 0
    });
  });
  // 填空 slot
  var next = 0;
  newLayout.forEach(function (L) {
    if (L.slotIndex >= 0) return;
    while (usedSlots[next]) next++;
    L.slotIndex = next;
    usedSlots[next] = true;
    next++;
  });
  newLayout.sort(function (a, b) { return a.slotIndex - b.slotIndex; });
  store.exhibition.layout = newLayout;
  return selected;
}

function galleryResolveEmotion(em) {
  if (!em) return { label: '', color: '#DAA520' };
  if (typeof em === 'string') {
    if (typeof emoDisplay === 'function') {
      var byLabel = emoDisplay({ label: em });
      if (byLabel && byLabel.color) return byLabel;
    }
    return { label: em, color: '#DAA520' };
  }
  if (typeof emoDisplay === 'function') return emoDisplay(em);
  return {
    label: em.label || '',
    color: em.color || em.canvas || '#DAA520'
  };
}

function galleryArtworkView(entry, meta) {
  meta = meta || {};
  var rawEmos = entry.emotions || [];
  var emos = rawEmos.map(galleryResolveEmotion);
  var labels = emos.map(function (em) { return em.label || ''; }).filter(Boolean);
  var mainEmo = labels[0] || '情緒';
  var dateLabel = entry.dateLabel || entry.date || '';
  var colors = entry.emotionColors || entry.colors || [];
  if (!colors.length) {
    colors = emos.map(function (em) { return em.canvas || em.color; }).filter(Boolean);
  }
  var frame = galleryFrameStyle(meta);
  return {
    id: entry.id,
    createdAt: entry.createdAt || entry.date || '',
    dateLabel: dateLabel,
    emotionColors: colors,
    moodStyle: entry.moodCat || entry.canvasStyle || 'positive',
    canvasDataUrl: entry.canvasDataUrl || entry.aiImageUrl || null,
    summary: entry.summary || '',
    quote: entry.quote || '',
    emotions: emos,
    emotionLabels: labels,
    title: meta.title || (dateLabel ? dateLabel + ' · ' + mainEmo : mainEmo),
    note: meta.poem || meta.note || '',
    poem: meta.poem || meta.note || '',
    poemAuto: !!meta.poemAuto,
    pinned: !!meta.pinned,
    hidden: !!meta.hidden,
    labels: Array.isArray(meta.labels) ? meta.labels : [],
    frameColor: frame.colorId,
    frameMaterial: frame.materialId,
    frameHex: frame.hex,
    frameClass: frame.className
  };
}

function galleryHash(str) {
  var h = 0;
  var s = String(str || '');
  for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateGalleryPoem(entry, labels, moodStyle) {
  var emo = (labels && labels[0]) || '心緒';
  var mood = moodStyle || (entry && entry.moodCat) || 'positive';
  var banks = {
    anger: [
      '火在胸口轉一圈\n我選擇慢慢放下',
      '怒意如潮又退潮\n岸邊仍有我的名',
      '咬緊的牙鬆開後\n世界沒有比較小'
    ],
    anxiety: [
      '心事繞成細線團\n呼吸把它理一理',
      '明天還未到門口\n我先把燈點亮',
      '擔心是未寄的信\n此刻先封回口袋'
    ],
    sad: [
      '雨停在窗玻璃上\n我學會把淚擦乾',
      '低潮也有潮間帶\n允許自己慢半拍',
      '灰色不是終點站\n只是換一種光線'
    ],
    self: [
      '對鏡說一句夠了\n我也值得被溫柔',
      '缺角的月亮仍亮\n完整不必一次到',
      '把苛責換成手帕\n輕輕接住今天的我'
    ],
    buffer: [
      '空白也是一種色\n讓心在此歇腳',
      '不急著給出答案\n先聽風穿過走廊',
      '中間地帶有光暈\n我在這裡剛好'
    ],
    positive: [
      '一抹顏色落牆角\n呼吸比昨天輕些',
      '喜悅很小但真實\n夠我走過這一夜',
      '暖意從掌心升起\n世界忽然近一點'
    ]
  };
  var pool = banks[mood] || banks.positive;
  // 含情緒詞的短詩變體
  var custom = [
    '「' + emo + '」停在色塊裡\n我看見自己了',
    emo + '不是敵人\n是來報信的鳥',
    '把' + emo + '掛上牆\n它就不再追著跑'
  ];
  var all = pool.concat(custom);
  var idx = galleryHash((entry && entry.id) || emo + mood) % all.length;
  var poem = all[idx];
  return Array.from(poem).slice(0, GALLERY_POEM_MAX).join('');
}

function ensureArtworkPoem(store, entry, art) {
  var meta = ensureArtMeta(store, entry.id);
  if (meta.poem && String(meta.poem).trim()) return String(meta.poem).trim();
  if (meta.note && String(meta.note).trim() && !/點此為作品/.test(meta.note)) {
    meta.poem = String(meta.note).trim();
    return meta.poem;
  }
  var poem = generateGalleryPoem(entry, art.emotionLabels, art.moodStyle);
  meta.poem = poem;
  meta.note = poem;
  meta.poemAuto = true;
  return poem;
}

function galleryThemeClass(theme) {
  if (theme === 'rain') return 'gal-theme-rain';
  if (theme === 'dawn') return 'gal-theme-dawn';
  if (theme === 'white') return 'gal-theme-white';
  if (theme === 'beige') return 'gal-theme-beige';
  if (theme === 'black') return 'gal-theme-black';
  return 'gal-theme-soft';
}

function galleryFrameStyle(meta) {
  meta = meta || {};
  var colorId = meta.frameColor || 'ivory';
  var matId = meta.frameMaterial || 'wood';
  var color = GALLERY_FRAME_COLORS.find(function (c) { return c.id === colorId; }) || GALLERY_FRAME_COLORS[0];
  return {
    colorId: color.id,
    materialId: matId,
    hex: color.hex,
    className: 'gal-mat-' + matId + ' gal-col-' + color.id
  };
}

function enterEmotionGallery() {
  S.curTab = 'gallery';
  try {
    var store = loadGalleryStore();
    _galleryState.viewMode = store.exhibition.viewMode || 'walk';
    _galleryState.theme = store.exhibition.theme || 'soft';
    if (!store.exhibition.musicId) {
      store.exhibition.musicId = GALLERY_MUSIC_DEFAULT;
      saveGalleryStore(store);
    }
  } catch (e) {}
  if (typeof updateTabUI === 'function') updateTabUI();
  // 進場前先淡出 App 背景音樂，再淡入展場音樂
  if (typeof fadeOutAppMusic === 'function') fadeOutAppMusic(500);
  startGalleryMusicFadeIn();
  playGalleryEnterTransition(function () {
    if (typeof showScreen === 'function') showScreen('gallery');
    renderEmotionGallery();
    if (typeof maybeShowGalleryTour === 'function') maybeShowGalleryTour();
  });
}

function playGalleryEnterTransition(done) {
  var portal = document.getElementById('gallery-portal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!portal || reduce) {
    if (typeof done === 'function') done();
    return;
  }
  if (_galleryState._entering) {
    if (typeof done === 'function') done();
    return;
  }
  _galleryState._entering = true;
  portal.classList.remove('opening');
  portal.classList.add('show');
  portal.setAttribute('aria-hidden', 'false');
  // 門廳停留更久，再開門走進（整體更慢）
  setTimeout(function () {
    portal.classList.add('opening');
    if (typeof done === 'function') done();
  }, 2800);
  setTimeout(function () {
    portal.classList.remove('show', 'opening');
    portal.setAttribute('aria-hidden', 'true');
    _galleryState._entering = false;
  }, 7200);
}

function exitEmotionGallery() {
  if (typeof TOUR !== 'undefined' && TOUR.active && TOUR.mode === 'gallery' && typeof endFeatureTour === 'function') {
    endFeatureTour();
  }
  stopGalleryDocumentary(true);
  unbindGalleryViewMagic();
  fadeOutGalleryMusic(900);
  if (typeof showScreen === 'function') showScreen('main');
  S.curTab = 'stats';
  if (typeof updateTabUI === 'function') updateTabUI();
  if (typeof renderMain === 'function') renderMain();
  if (typeof syncAppMusic === 'function') syncAppMusic();
}

function getGalleryMusicTrack(id) {
  var found = GALLERY_MUSIC_TRACKS.find(function (t) { return t.id === id; });
  return found || GALLERY_MUSIC_TRACKS.find(function (t) { return t.id === GALLERY_MUSIC_DEFAULT; });
}

function getGalleryMusicLabel(id) {
  if (id === 'none') return '不要音樂';
  var found = GALLERY_MUSIC_TRACKS.find(function (t) { return t.id === id; });
  return (found && found.label) || 'Self-management';
}

function getGalleryAudioEl() {
  if (!_galleryAudio) {
    _galleryAudio = new Audio();
    _galleryAudio.loop = true;
    _galleryAudio.preload = 'auto';
  }
  return _galleryAudio;
}

function clearGalleryMusicFade() {
  if (_galleryMusicFadeTimer) {
    clearInterval(_galleryMusicFadeTimer);
    _galleryMusicFadeTimer = null;
  }
}

function galleryMusicFileUrl(file) {
  if (!file) return '';
  return encodeURI(file);
}

function applyGalleryMusicSource(track) {
  var audio = getGalleryAudioEl();
  if (!track || !track.file) {
    audio.pause();
    audio.removeAttribute('src');
    try { audio.load(); } catch (e) {}
    return false;
  }
  var url = galleryMusicFileUrl(track.file);
  var abs = new URL(url, window.location.href).href;
  if (audio.src !== abs) {
    audio.src = url;
    try { audio.load(); } catch (e2) {}
  }
  return true;
}

function startGalleryMusicFadeIn(overrideId) {
  var store = loadGalleryStore();
  var musicId = overrideId;
  if (musicId == null || musicId === '') {
    musicId = store.exhibition.musicId || GALLERY_MUSIC_DEFAULT;
    if (!store.exhibition.musicId) {
      store.exhibition.musicId = GALLERY_MUSIC_DEFAULT;
      saveGalleryStore(store);
      musicId = GALLERY_MUSIC_DEFAULT;
    }
  }
  if (musicId === 'none') {
    fadeOutGalleryMusic(400);
    return;
  }
  var track = getGalleryMusicTrack(musicId);
  if (!applyGalleryMusicSource(track)) return;
  var audio = getGalleryAudioEl();
  clearGalleryMusicFade();
  audio.volume = 0;
  var playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      var unlock = function () {
        document.removeEventListener('pointerdown', unlock, true);
        startGalleryMusicFadeIn(overrideId);
      };
      document.addEventListener('pointerdown', unlock, true);
    });
  }
  var target = GALLERY_MUSIC_VOLUME;
  var step = target / 36;
  _galleryMusicFadeTimer = setInterval(function () {
    if (!audio) return;
    if (audio.volume + step >= target) {
      audio.volume = target;
      clearGalleryMusicFade();
    } else {
      audio.volume = Math.min(target, audio.volume + step);
    }
  }, 100);
}

function fadeOutGalleryMusic(ms) {
  var audio = _galleryAudio;
  if (!audio) return;
  clearGalleryMusicFade();
  ms = typeof ms === 'number' ? ms : 700;
  var startVol = audio.volume;
  if (!startVol || audio.paused) {
    audio.pause();
    return;
  }
  var steps = Math.max(8, Math.round(ms / 50));
  var i = 0;
  _galleryMusicFadeTimer = setInterval(function () {
    i++;
    audio.volume = Math.max(0, startVol * (1 - i / steps));
    if (i >= steps) {
      clearGalleryMusicFade();
      audio.pause();
      audio.volume = GALLERY_MUSIC_VOLUME;
    }
  }, 50);
}

function openGalleryMusicPicker() {
  var store = loadGalleryStore();
  var cur = store.exhibition.musicId || GALLERY_MUSIC_DEFAULT;
  var host = document.getElementById('gal-detail-root');
  if (!host) return;
  var list = GALLERY_MUSIC_TRACKS.map(function (t) {
    var on = cur === t.id ? ' on' : '';
    return '<button type="button" class="gal-music-item' + on + '" onclick="setGalleryMusic(\'' + t.id + '\')">' +
      '<span class="gal-music-name">' + escapeGal(t.label) + '</span>' +
      (cur === t.id ? '<span class="gal-music-playing">目前</span>' : '') +
    '</button>';
  }).join('');
  host.classList.add('show');
  host.innerHTML =
    '<div class="gal-detail-mask" onclick="closeGalleryMusicPicker()"></div>' +
    '<div class="gal-poem-sheet gal-music-sheet" role="dialog" aria-modal="true" aria-labelledby="gal-music-heading">' +
      '<button type="button" class="gal-detail-close" onclick="closeGalleryMusicPicker()" aria-label="關閉">×</button>' +
      '<h2 id="gal-music-heading" class="gal-detail-title">展場音樂</h2>' +
      '<p class="gal-poem-hint">選擇背景音樂；也可關閉音樂。</p>' +
      '<div class="gal-music-list">' + list + '</div>' +
    '</div>';
}

function closeGalleryMusicPicker() {
  var host = document.getElementById('gal-detail-root');
  if (host) {
    host.classList.remove('show');
    host.innerHTML = '';
  }
  renderEmotionGallery();
}

function setGalleryMusic(trackId) {
  var store = loadGalleryStore();
  store.exhibition.musicId = trackId || 'none';
  saveGalleryStore(store);
  if (trackId === 'none') {
    fadeOutGalleryMusic(500);
    if (typeof showToast === 'function') showToast('已關閉展場音樂');
  } else {
    startGalleryMusicFadeIn();
    if (typeof showToast === 'function') showToast('展場音樂：' + getGalleryMusicLabel(trackId));
  }
  closeGalleryMusicPicker();
}

function renderEmotionGallery() {
  var root = document.getElementById('gallery-root');
  if (!root) return;
  unbindGalleryViewMagic();
  var store = loadGalleryStore();
  var selected = syncGalleryArtworks(store);
  // 為每幅作品確保有短詩
  selected.forEach(function (e) {
    var art = galleryArtworkView(e, store.artworksMeta[e.id]);
    ensureArtworkPoem(store, e, art);
  });
  saveGalleryStore(store);
  _galleryState.theme = store.exhibition.theme || 'soft';
  _galleryState.viewMode = store.exhibition.viewMode || _galleryState.viewMode || 'walk';
  store.exhibition.viewMode = _galleryState.viewMode;

  var byId = {};
  selected.forEach(function (e) { byId[String(e.id)] = e; });
  var slotsHtml = '';
  var i;
  for (i = 0; i < GALLERY_MAX_SLOTS; i++) {
    var layoutItem = (store.exhibition.layout || []).find(function (L) { return L.slotIndex === i; });
    var wallCard = (store.exhibition.wallTitleCards || []).find(function (c) { return c.slotAfter === i - 1; });
    if (i === 0) {
      var firstCard = (store.exhibition.wallTitleCards || []).find(function (c) { return c.slotAfter === -1; });
      if (firstCard) {
        slotsHtml += '<div class="gal-wall-card" data-card-id="' + escapeGal(firstCard.id) + '">' +
          '<p>' + escapeGal(firstCard.text) + '</p></div>';
      }
    }
    if (wallCard && i > 0) {
      slotsHtml += '<div class="gal-wall-card" data-card-id="' + escapeGal(wallCard.id) + '">' +
        '<p>' + escapeGal(wallCard.text) + '</p></div>';
    }
    if (!layoutItem) {
      slotsHtml += renderEmptyPlinth(i);
      continue;
    }
    var entry = byId[String(layoutItem.artworkId)];
    if (!entry) {
      slotsHtml += renderEmptyPlinth(i);
      continue;
    }
    var art = galleryArtworkView(entry, store.artworksMeta[entry.id]);
    art.poem = ensureArtworkPoem(store, entry, art);
    slotsHtml += renderArtworkFrame(art, i, _galleryState.curate);
  }
  saveGalleryStore(store);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var viewMode = _galleryState.viewMode === 'overview' ? 'overview' : 'walk';
  root.className = 'gal-shell ' + galleryThemeClass(store.exhibition.theme) +
    ' gal-view-' + viewMode +
    (_galleryState.curate ? ' gal-curating' : '') +
    (reduce ? ' gal-reduced' : '') +
    ' gal-enter';

  var rangeLabel = selected.length
    ? ('近 ' + selected.length + ' 件心靈畫布')
    : '尚無作品';
  var themeName = GALLERY_THEME_NAMES[store.exhibition.theme] || '柔光';
  var viewLabel = viewMode === 'overview' ? '遠距總覽' : '近觀漫遊';
  var wallFx = store.exhibition.wallFx || 'none';
  if (GALLERY_WALL_FX_ORDER.indexOf(wallFx) < 0) wallFx = 'none';
  store.exhibition.wallFx = wallFx;
  var fxName = GALLERY_WALL_FX_NAMES[wallFx] || '無';

  var curating = !!_galleryState.curate;
  var musicId = store.exhibition.musicId || GALLERY_MUSIC_DEFAULT;
  var toolbarExtra = '';
  if (curating) {
    toolbarExtra =
      '<span class="gal-toolbar-sep" aria-hidden="true"></span>' +
      '<span id="gal-adj-tools" class="gal-adj-tools">' +
        '<button type="button" class="gal-tool gal-tool-adj' + (wallFx !== 'none' ? ' on' : '') + '" onclick="cycleGalleryWallFx()">牆飾 · ' + fxName + '</button>' +
        '<button type="button" class="gal-tool gal-tool-adj" onclick="cycleGalleryTheme()">主題 · ' + themeName + '</button>' +
        '<button type="button" class="gal-tool gal-tool-adj' + (musicId !== 'none' ? ' on' : '') + '" onclick="openGalleryMusicPicker()">SEL曲集</button>' +
      '</span>';
  }

  root.innerHTML =
    '<header class="gal-top">' +
      '<button type="button" class="gal-back-home" onclick="exitEmotionGallery()" aria-label="返回主頁">' +
        '<span class="gal-back-chevron" aria-hidden="true">‹</span>' +
        '<span class="gal-back-label">返回主頁</span>' +
      '</button>' +
      '<div class="gal-top-mid">' +
        '<button type="button" class="gal-title-btn" onclick="openRenameExhibition()">' +
          '<h1 class="gal-title">' + escapeGal(store.exhibition.title || '我的情緒藝廊') + '</h1>' +
          '<span class="gal-edit-hint">✎</span>' +
        '</button>' +
        '<p class="gal-sub">我的 SEL 數位展場 · ' + escapeGal(rangeLabel) + '</p>' +
      '</div>' +
      '<button type="button" class="gal-tour-btn" id="gal-tour-btn" onclick="startGalleryTour(true)" aria-label="情緒藝廊使用導覽" title="使用導覽">導覽</button>' +
    '</header>' +
    '<div class="gal-hall" id="gal-hall">' +
      '<div class="gal-floor" aria-hidden="true"></div>' +
      '<div class="gal-aisle" aria-hidden="true"></div>' +
      '<div class="gal-overview-stage">' +
        '<div class="gal-wall" id="gal-wall">' +
          renderGalleryWallFx(wallFx) +
          slotsHtml +
        '</div>' +
      '</div>' +
    '</div>' +
    '<footer class="gal-toolbar">' +
      '<button type="button" class="gal-tool gal-tool-main' + (viewMode === 'overview' ? ' on' : '') + '" id="gal-btn-view" onclick="toggleGalleryViewMode()">' +
        viewLabel +
      '</button>' +
      '<button type="button" class="gal-tool gal-tool-main" id="gal-btn-docu" onclick="startGalleryDocumentary()">紀錄片</button>' +
      '<button type="button" class="gal-tool gal-tool-main' + (curating ? ' on' : '') + '" id="gal-btn-curate" onclick="toggleGalleryCurate()">' +
        (curating ? '完成策展' : '策展模式') +
      '</button>' +
      toolbarExtra +
    '</footer>' +
    (curating
      ? '<p class="gal-hint">拖曳畫作換位；點畫框左下角筆圖可換框色與材質；點銘牌可改寫詩句。</p>'
      : '') +
    '<div class="gal-view-magic" id="gal-view-magic" aria-hidden="true">' +
      '<div class="gal-docu-magic-glow" id="gal-view-magic-glow"></div>' +
    '</div>' +
    '<div id="gal-detail-root"></div>';

  requestAnimationFrame(function () {
    paintGalleryCanvases(selected, store);
    if (viewMode === 'walk') bindGalleryParallax();
    if (_galleryState.curate) bindGalleryDrag();
    bindGalleryStickerDrag();
    bindGalleryViewMagic(root);
    if (_galleryState.detailId) openGalleryDetail(_galleryState.detailId);
  });
}

function toggleGalleryViewMode() {
  _galleryState.viewMode = _galleryState.viewMode === 'overview' ? 'walk' : 'overview';
  var store = loadGalleryStore();
  store.exhibition.viewMode = _galleryState.viewMode;
  saveGalleryStore(store);
  if (typeof showToast === 'function') {
    showToast(_galleryState.viewMode === 'overview' ? '遠距總覽：一眼看見整面牆' : '近觀漫遊：沿展牆細看');
  }
  renderEmotionGallery();
}

function cycleGalleryWallFx() {
  var store = loadGalleryStore();
  var order = GALLERY_WALL_FX_ORDER;
  var cur = store.exhibition.wallFx || 'none';
  var i = order.indexOf(cur);
  store.exhibition.wallFx = order[(i + 1) % order.length];
  saveGalleryStore(store);
  if (typeof showToast === 'function') {
    showToast('牆飾特效：' + (GALLERY_WALL_FX_NAMES[store.exhibition.wallFx] || '無'));
  }
  renderEmotionGallery();
}

function renderGalleryWallFx(fx) {
  if (!fx || fx === 'none') {
    return '<div class="gal-wall-fx" data-fx="none" aria-hidden="true"></div>';
  }
  var bits = ['<div class="gal-fx-ambient" aria-hidden="true"></div>'];
  var i;
  // 粒子佈滿整面牆：上半牆（畫作上方）為主，下半與間隙也補點，避免都躲在畫框後面
  function scatter(cls, count, yMax, extraStyleFn) {
    for (var n = 0; n < count; n++) {
      var x = ((n * 37 + 11) % 97) + 1.5;
      var y = ((n * 53 + 7) % Math.max(1, yMax));
      var style = 'left:' + x + '%;top:' + y + '%;animation-delay:' + ((n % 12) * 0.28) + 's';
      if (extraStyleFn) style += ';' + extraStyleFn(n);
      bits.push('<i class="' + cls + '" style="' + style + '"></i>');
    }
  }
  if (fx === 'glitter') {
    scatter('gal-fx-spark', 48, 52, function (n) {
      var s = 3 + (n % 3);
      return 'width:' + s + 'px;height:' + s + 'px';
    });
    scatter('gal-fx-spark', 24, 88, function (n) {
      return 'width:3px;height:3px;opacity:.55';
    });
  } else if (fx === 'magic') {
    var colors = ['rgba(168,153,212,.5)', 'rgba(125,184,200,.45)', 'rgba(232,168,136,.45)', 'rgba(143,196,168,.45)'];
    for (i = 0; i < 18; i++) {
      bits.push('<i class="gal-fx-orb" style="left:' + (4 + (i * 11) % 90) + '%;top:' + (4 + (i * 17) % 48) +
        '%;width:' + (16 + (i % 5) * 8) + 'px;height:' + (16 + (i % 5) * 8) + 'px;background:' + colors[i % 4] +
        ';animation-delay:' + (i * 0.32) + 's"></i>');
    }
  } else if (fx === 'geo') {
    for (i = 0; i < 22; i++) {
      var top = 3 + (i * 13) % 50;
      if (i % 3 === 0) {
        bits.push('<i class="gal-fx-geo tri" style="left:' + (4 + (i * 9) % 90) + '%;top:' + top +
          '%;animation-delay:' + (i * 0.18) + 's"></i>');
      } else {
        bits.push('<i class="gal-fx-geo" style="left:' + (3 + (i * 8) % 92) + '%;top:' + top +
          '%;width:' + (10 + i % 6 * 5) + 'px;height:' + (10 + i % 6 * 5) + 'px;border-radius:' + (i % 2 ? '50%' : '2px') +
          ';animation-delay:' + (i * 0.2) + 's"></i>');
      }
    }
  } else if (fx === 'stardust') {
    scatter('gal-fx-dust', 56, 55, function (n) {
      return 'animation-duration:' + (4.2 + (n % 5) * 0.45) + 's';
    });
    scatter('gal-fx-dust', 20, 90, function () { return ''; });
  } else if (fx === 'goldshine') {
    scatter('gal-fx-gold', 36, 50, function (n) {
      return '--spin:' + (n % 2 ? '1' : '-1');
    });
    for (i = 0; i < 28; i++) {
      bits.push('<i class="gal-fx-gold-flake" style="left:' + (2 + (i * 7) % 96) + '%;animation-delay:' +
        ((i % 8) * 0.45) + 's;animation-duration:' + (4.8 + i % 5) + 's"></i>');
    }
  } else if (fx === 'silverrings') {
    for (i = 0; i < 12; i++) {
      bits.push('<span class="gal-fx-rings" style="left:' + (6 + (i % 6) * 16) + '%;top:' + (8 + Math.floor(i / 6) * 22) +
        '%;animation-delay:' + (i * 0.4) + 's">' +
        '<i style="--r:1"></i><i style="--r:2"></i><i style="--r:3"></i><i style="--r:4"></i>' +
      '</span>');
    }
  }
  return '<div class="gal-wall-fx" data-fx="' + fx + '" aria-hidden="true">' + bits.join('') + '</div>';
}

function bindGalleryParallax() {
  var hall = document.getElementById('gal-hall');
  var wall = document.getElementById('gal-wall');
  var floor = hall && hall.querySelector('.gal-floor');
  if (!hall || !wall) return;
  wall.classList.add('gal-parallax-wall');
  if (floor) floor.classList.add('gal-parallax-floor');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  hall.addEventListener('scroll', function () {
    var x = hall.scrollLeft;
    wall.style.transform = 'translateX(' + (-x * 0.04) + 'px)';
    if (floor) floor.style.transform = 'translateX(' + (-x * 0.12) + 'px)';
    hall.querySelectorAll('.gal-caption').forEach(function (cap) {
      cap.style.transform = 'translateX(' + (x * 0.015) + 'px)';
    });
  }, { passive: true });
}

function escapeGal(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderEmptyPlinth(slotIndex) {
  return '<div class="gal-slot gal-empty" data-slot="' + slotIndex + '">' +
    '<div class="gal-spotlight" aria-hidden="true"></div>' +
    '<div class="gal-frame gal-frame-empty">' +
      '<p>等待下一幅<br>心靈畫布</p>' +
    '</div>' +
    '<div class="gal-caption gal-caption-empty"><span class="gal-cap-line"></span></div>' +
  '</div>';
}

function renderArtworkFrame(art, slotIndex, curate) {
  var dots = (art.emotions || []).slice(0, 4).map(function (em) {
    var c = em.color || em.canvas || '#DAA520';
    return '<span class="gal-emo-dot" style="background:' + escapeGal(c) + '" title="' + escapeGal(em.label || '') + '"></span>';
  }).join('');
  var stickers = (art.labels || []).map(function (lb) {
    return '<button type="button" class="gal-sticker" data-label-id="' + escapeGal(lb.id) + '" ' +
      'style="left:' + (lb.x || 8) + '%;top:' + (lb.y || 82) + '%" ' +
      'onclick="event.stopPropagation();editGalleryLabel(\'' + art.id + '\',\'' + escapeGal(lb.id) + '\')">' +
      escapeGal(lb.text) + '</button>';
  }).join('');
  var poem = String(art.poem || '').trim();
  var poemHtml = '<p class="gal-cap-poem">' + escapeGal(poem).replace(/\n/g, '<br>') + '</p>';
  var frameCls = 'gal-frame ' + (art.frameClass || 'gal-mat-wood gal-col-ivory');
  return '<div class="gal-slot' + (art.pinned ? ' gal-pinned' : '') + '" data-slot="' + slotIndex + '" data-art-id="' + escapeGal(art.id) + '" ' +
    (curate ? 'draggable="true"' : '') + '>' +
    '<div class="gal-spotlight" aria-hidden="true"></div>' +
    '<div class="gal-frame-wrap">' +
      '<button type="button" class="' + frameCls + '" style="--gal-frame-c:' + escapeGal(art.frameHex || '#e8e2d4') + '" ' +
        'onclick="openGalleryDetail(\'' + art.id + '\')" aria-label="' + escapeGal(art.title) + '">' +
        '<canvas class="gal-cv" id="gal-cv-' + escapeGal(art.id) + '" width="280" height="175"></canvas>' +
        (art.pinned ? '<span class="gal-pin-badge" title="主視覺釘選">✦</span>' : '') +
      '</button>' +
      (curate
        ? '<button type="button" class="gal-frame-edit-btn" onclick="event.stopPropagation();openGalleryFrameEditor(\'' + art.id + '\')" aria-label="更換畫框顏色與材質" title="更換畫框">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
          '</button>'
        : '') +
      stickers +
    '</div>' +
    '<button type="button" class="gal-caption" onclick="editGalleryCaption(\'' + art.id + '\')" aria-label="改寫詩句">' +
      '<p class="gal-cap-title">' + escapeGal(art.title) + '</p>' +
      '<p class="gal-cap-media">心靈畫布 · 情緒色域</p>' +
      poemHtml +
      '<div class="gal-cap-dots">' + dots + '</div>' +
    '</button>' +
  '</div>';
}

function paintGalleryCanvases(entries, store) {
  entries.forEach(function (e, idx) {
    var cv = document.getElementById('gal-cv-' + e.id);
    if (!cv) return;
    var meta = store.artworksMeta[e.id] || {};
    var art = galleryArtworkView(e, meta);
    var delay = Math.min(idx * 70, 500);
    setTimeout(function () {
      var slotW = Math.round(cv.clientWidth || cv.offsetWidth || 280);
      var W = Math.max(slotW, 160);
      var H = Math.round(W * 0.625);
      if (art.canvasDataUrl && typeof drawCanvasFromDataUrl === 'function') {
        drawCanvasFromDataUrl('gal-cv-' + e.id, art.canvasDataUrl, W, H, art.emotionColors, art.moodStyle);
      } else if (typeof drawSavedCanvas === 'function') {
        drawSavedCanvas('gal-cv-' + e.id, art.emotionColors, art.moodStyle, W, H, {
          seed: String(art.id) + art.moodStyle
        });
      }
      cv.classList.add('gal-cv-ready');
    }, delay);
  });
}

/** 視窗縮放時依畫位寬度重繪，維持 8:5，避免變形 */
function resizeGalleryCanvases() {
  var store = loadGalleryStore();
  var entries = syncGalleryArtworks(store);
  if (!entries || !entries.length) return;
  entries.forEach(function (e) {
    var cv = document.getElementById('gal-cv-' + e.id);
    if (!cv) return;
    var meta = store.artworksMeta[e.id] || {};
    var art = galleryArtworkView(e, meta);
    var slotW = Math.round(cv.clientWidth || cv.offsetWidth || 280);
    var W = Math.max(slotW, 160);
    var H = Math.round(W * 0.625);
    if (art.canvasDataUrl && typeof drawCanvasFromDataUrl === 'function') {
      drawCanvasFromDataUrl('gal-cv-' + e.id, art.canvasDataUrl, W, H, art.emotionColors, art.moodStyle);
    } else if (typeof drawSavedCanvas === 'function') {
      drawSavedCanvas('gal-cv-' + e.id, art.emotionColors, art.moodStyle, W, H, {
        seed: String(art.id) + art.moodStyle
      });
    }
  });
  var detailCv = document.getElementById('gal-detail-cv');
  if (detailCv && _galleryState && _galleryState.detailId) {
    var de = entries.find(function (x) { return String(x.id) === String(_galleryState.detailId); });
    if (de) {
      var dMeta = store.artworksMeta[de.id] || {};
      var dArt = galleryArtworkView(de, dMeta);
      var dW = Math.max(Math.round(detailCv.clientWidth || 360), 200);
      var dH = Math.round(dW * 0.625);
      if (dArt.canvasDataUrl && typeof drawCanvasFromDataUrl === 'function') {
        drawCanvasFromDataUrl('gal-detail-cv', dArt.canvasDataUrl, dW, dH, dArt.emotionColors, dArt.moodStyle);
      } else if (typeof drawSavedCanvas === 'function') {
        drawSavedCanvas('gal-detail-cv', dArt.emotionColors, dArt.moodStyle, dW, dH, {
          seed: String(dArt.id) + dArt.moodStyle
        });
      }
    }
  }
}

function toggleGalleryCurate() {
  _galleryState.curate = !_galleryState.curate;
  if (!_galleryState.curate) {
    var store = loadGalleryStore();
    saveGalleryStore(store);
    if (typeof showToast === 'function') showToast('展牆佈局已儲存');
  }
  renderEmotionGallery();
}

function cycleGalleryTheme() {
  var store = loadGalleryStore();
  var order = GALLERY_THEME_ORDER;
  var i = order.indexOf(store.exhibition.theme || 'soft');
  store.exhibition.theme = order[(i + 1) % order.length];
  saveGalleryStore(store);
  if (typeof showToast === 'function') showToast('展場主題：' + (GALLERY_THEME_NAMES[store.exhibition.theme] || ''));
  renderEmotionGallery();
}

function openRenameExhibition() {
  var store = loadGalleryStore();
  var next = window.prompt('為你的展場取名', store.exhibition.title || '我的情緒藝廊');
  if (next == null) return;
  next = String(next).trim().slice(0, 24);
  if (!next) return;
  store.exhibition.title = next;
  saveGalleryStore(store);
  renderEmotionGallery();
}

function promptAddWallCard() {
  var text = window.prompt('展牆標題卡（例如：本週的出口）', '本週的出口');
  if (text == null) return;
  text = String(text).trim().slice(0, 20);
  if (!text) return;
  var store = loadGalleryStore();
  if (!store.exhibition.wallTitleCards) store.exhibition.wallTitleCards = [];
  store.exhibition.wallTitleCards.push({
    id: 'wc_' + Date.now(),
    text: text,
    slotAfter: -1
  });
  saveGalleryStore(store);
  renderEmotionGallery();
}

function bindGalleryDrag() {
  var wall = document.getElementById('gal-wall');
  if (!wall) return;
  wall.querySelectorAll('.gal-slot[data-art-id]').forEach(function (slot) {
    slot.addEventListener('dragstart', function (e) {
      slot.classList.add('gal-dragging');
      _galleryState.dragFrom = +slot.getAttribute('data-slot');
      try { e.dataTransfer.setData('text/plain', slot.getAttribute('data-art-id')); } catch (err) {}
    });
    slot.addEventListener('dragend', function () {
      slot.classList.remove('gal-dragging');
      _galleryState.dragFrom = null;
    });
    slot.addEventListener('dragover', function (e) {
      e.preventDefault();
      slot.classList.add('gal-drop-target');
    });
    slot.addEventListener('dragleave', function () {
      slot.classList.remove('gal-drop-target');
    });
    slot.addEventListener('drop', function (e) {
      e.preventDefault();
      slot.classList.remove('gal-drop-target');
      var toSlot = +slot.getAttribute('data-slot');
      var fromSlot = _galleryState.dragFrom;
      if (fromSlot == null || fromSlot === toSlot) return;
      swapGallerySlots(fromSlot, toSlot);
    });
    // 觸控長按換位
    var touchTimer = null;
    var touching = false;
    slot.addEventListener('touchstart', function (e) {
      touching = true;
      touchTimer = setTimeout(function () {
        if (!touching) return;
        _galleryState.dragFrom = +slot.getAttribute('data-slot');
        slot.classList.add('gal-dragging');
        if (typeof showToast === 'function') showToast('拖到其他畫位放開以換位');
      }, 420);
    }, { passive: true });
    slot.addEventListener('touchend', function (e) {
      touching = false;
      clearTimeout(touchTimer);
      if (_galleryState.dragFrom == null) {
        slot.classList.remove('gal-dragging');
        return;
      }
      var touch = e.changedTouches && e.changedTouches[0];
      if (!touch) return;
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      var target = el && el.closest ? el.closest('.gal-slot') : null;
      slot.classList.remove('gal-dragging');
      if (target) {
        var toSlot = +target.getAttribute('data-slot');
        var fromSlot = _galleryState.dragFrom;
        _galleryState.dragFrom = null;
        if (fromSlot != null && toSlot !== fromSlot) swapGallerySlots(fromSlot, toSlot);
      } else {
        _galleryState.dragFrom = null;
      }
    });
    slot.addEventListener('touchcancel', function () {
      touching = false;
      clearTimeout(touchTimer);
      slot.classList.remove('gal-dragging');
      _galleryState.dragFrom = null;
    });
  });
  wall.querySelectorAll('.gal-slot.gal-empty').forEach(function (slot) {
    slot.addEventListener('dragover', function (e) { e.preventDefault(); slot.classList.add('gal-drop-target'); });
    slot.addEventListener('dragleave', function () { slot.classList.remove('gal-drop-target'); });
    slot.addEventListener('drop', function (e) {
      e.preventDefault();
      slot.classList.remove('gal-drop-target');
      var toSlot = +slot.getAttribute('data-slot');
      var fromSlot = _galleryState.dragFrom;
      if (fromSlot == null) return;
      swapGallerySlots(fromSlot, toSlot);
    });
  });
}

function bindGalleryStickerDrag() {
  var wall = document.getElementById('gal-wall');
  if (!wall) return;
  wall.querySelectorAll('.gal-sticker').forEach(function (st) {
    var dragging = false;
    var artId = null;
    var labelId = st.getAttribute('data-label-id');
    var frame = st.closest('.gal-frame-wrap') || st.closest('.gal-frame');
    var slot = st.closest('.gal-slot');
    if (slot) artId = slot.getAttribute('data-art-id');
    function moveTo(clientX, clientY) {
      if (!frame || !artId || !labelId) return;
      var rect = frame.getBoundingClientRect();
      var x = ((clientX - rect.left) / rect.width) * 100;
      var y = ((clientY - rect.top) / rect.height) * 100;
      x = Math.max(2, Math.min(88, x));
      y = Math.max(2, Math.min(92, y));
      st.style.left = x + '%';
      st.style.top = y + '%';
      return { x: x, y: y };
    }
    st.addEventListener('pointerdown', function (e) {
      if (!_galleryState.curate && !_galleryState.detailId) {
        // 允許在展牆直接微調
      }
      dragging = true;
      st.setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    });
    st.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      moveTo(e.clientX, e.clientY);
    });
    st.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var pos = moveTo(e.clientX, e.clientY);
      if (!pos) return;
      var store = loadGalleryStore();
      var meta = ensureArtMeta(store, artId);
      var lb = (meta.labels || []).find(function (l) { return l.id === labelId; });
      if (lb) {
        lb.x = pos.x;
        lb.y = pos.y;
        saveGalleryStore(store);
      }
    });
  });
}

function promptGalleryAddLabel() {
  var store = loadGalleryStore();
  var layout = store.exhibition.layout || [];
  if (!layout.length) {
    if (typeof showToast === 'function') showToast('還沒有作品可貼標籤');
    return;
  }
  if (_galleryState.detailId) {
    addGalleryLabel(_galleryState.detailId);
    return;
  }
  var first = layout[0];
  if (first && first.artworkId) {
    openGalleryDetail(first.artworkId);
    setTimeout(function () { addGalleryLabel(first.artworkId); }, 80);
  }
}

function swapGallerySlots(fromSlot, toSlot) {
  var store = loadGalleryStore();
  var layout = store.exhibition.layout || [];
  var a = layout.find(function (L) { return L.slotIndex === fromSlot; });
  var b = layout.find(function (L) { return L.slotIndex === toSlot; });
  if (!a) return;
  if (b) {
    var tmp = a.slotIndex;
    a.slotIndex = b.slotIndex;
    b.slotIndex = tmp;
  } else {
    a.slotIndex = toSlot;
  }
  saveGalleryStore(store);
  renderEmotionGallery();
}

function openGalleryDetail(artId) {
  _galleryState.detailId = artId;
  var store = loadGalleryStore();
  var entry = (S.diary || []).find(function (d) { return String(d.id) === String(artId); });
  var root = document.getElementById('gal-detail-root');
  var shell = document.getElementById('gallery-root');
  if (!root || !entry) return;
  if (shell) {
    shell.classList.add('gal-focus');
    shell.querySelectorAll('.gal-slot').forEach(function (s) {
      s.classList.toggle('gal-slot-focus', String(s.getAttribute('data-art-id')) === String(artId));
    });
  }
  var art = galleryArtworkView(entry, store.artworksMeta[artId] || store.artworksMeta[String(artId)] || {});
  art.poem = ensureArtworkPoem(store, entry, art);
  saveGalleryStore(store);
  var labelChips = (art.labels || []).map(function (lb) {
    return '<span class="gal-detail-chip">' + escapeGal(lb.text) +
      ' <button type="button" onclick="removeGalleryLabel(\'' + art.id + '\',\'' + escapeGal(lb.id) + '\')" aria-label="刪除">×</button></span>';
  }).join('');
  var emoDots = (art.emotions || []).map(function (em) {
    return '<span class="gal-emo-dot" style="background:' + escapeGal(em.color || '#ccc') + '"></span> ' +
      '<span class="gal-detail-emo">' + escapeGal(em.label || '') + '</span>';
  }).join(' · ');
  var poemBlock = '<blockquote class="gal-detail-poem">' + escapeGal(art.poem).replace(/\n/g, '<br>') + '</blockquote>' +
    (art.poemAuto ? '<p class="gal-muted" style="margin-top:-6px;margin-bottom:10px">系統依情緒生成 · 可改寫</p>' : '');
  var frameCls = 'gal-detail-frame ' + (art.frameClass || '');
  var matLabel = (GALLERY_FRAME_MATERIALS.find(function (m) { return m.id === art.frameMaterial; }) || {}).label || '木紋';
  var colLabel = (GALLERY_FRAME_COLORS.find(function (c) { return c.id === art.frameColor; }) || {}).label || '米白';

  root.innerHTML =
    '<div class="gal-detail-mask" onclick="closeGalleryDetail()"></div>' +
    '<div class="gal-detail-sheet" role="dialog" aria-modal="true">' +
      '<button type="button" class="gal-detail-close" onclick="closeGalleryDetail()" aria-label="關閉">×</button>' +
      '<div class="' + frameCls + '" style="--gal-frame-c:' + escapeGal(art.frameHex || '#e8e2d4') + '">' +
        '<canvas id="gal-detail-cv" width="360" height="225"></canvas>' +
      '</div>' +
      '<p class="gal-detail-date">' + escapeGal(art.dateLabel) + '</p>' +
      '<h2 class="gal-detail-title">' + escapeGal(art.title) + '</h2>' +
      poemBlock +
      '<div class="gal-detail-emos">' + emoDots + '</div>' +
      '<div class="gal-detail-labels">' + (labelChips || '<span class="gal-muted">尚未貼標籤</span>') + '</div>' +
      '<div class="gal-detail-actions">' +
        '<button type="button" class="gal-tool" onclick="openGalleryFrameEditor(\'' + art.id + '\')">畫框樣式 · ' +
          escapeGal(colLabel) + '／' + escapeGal(matLabel) + '</button>' +
        '<button type="button" class="gal-tool" onclick="editGalleryCaption(\'' + art.id + '\')">改寫詩句</button>' +
        '<button type="button" class="gal-tool" onclick="regenerateGalleryPoem(\'' + art.id + '\')">換一則詩</button>' +
        '<button type="button" class="gal-tool" onclick="toggleGalleryPin(\'' + art.id + '\')">' + (art.pinned ? '取消主視覺' : '設為主視覺') + '</button>' +
        '<button type="button" class="gal-tool" onclick="toggleGalleryHidden(\'' + art.id + '\')">' + (art.hidden ? '顯示於展牆' : '自展牆隱藏') + '</button>' +
      '</div>' +
    '</div>';

  root.classList.add('show');
  setTimeout(function () {
    if (art.canvasDataUrl && typeof drawCanvasFromDataUrl === 'function') {
      drawCanvasFromDataUrl('gal-detail-cv', art.canvasDataUrl, 360, 225, art.emotionColors, art.moodStyle);
    } else if (typeof drawSavedCanvas === 'function') {
      drawSavedCanvas('gal-detail-cv', art.emotionColors, art.moodStyle, 360, 225, {
        seed: String(art.id) + 'detail'
      });
    }
  }, 40);
}

function closeGalleryDetail() {
  _galleryState.detailId = null;
  var root = document.getElementById('gal-detail-root');
  var shell = document.getElementById('gallery-root');
  if (root) {
    root.classList.remove('show');
    root.innerHTML = '';
  }
  if (shell) {
    shell.classList.remove('gal-focus');
    shell.querySelectorAll('.gal-slot-focus').forEach(function (s) {
      s.classList.remove('gal-slot-focus');
    });
  }
}

function ensureArtMeta(store, artId) {
  artId = String(artId);
  if (!store.artworksMeta[artId]) {
    store.artworksMeta[artId] = {
      title: '', poem: '', note: '', poemAuto: false,
      frameColor: 'ivory', frameMaterial: 'wood',
      pinned: false, hidden: false, labels: []
    };
  }
  var m = store.artworksMeta[artId];
  if (!m.poem && m.note) m.poem = m.note;
  if (!m.frameColor) m.frameColor = 'ivory';
  if (!m.frameMaterial) m.frameMaterial = 'wood';
  return m;
}

var GALLERY_POEM_PROMPTS = [
  '一抹顏色落牆角\n呼吸比昨天輕些',
  '不敢說出口的話\n都藏在這片色裡',
  '雨停了，我還在\n慢慢把自己拼回',
  '今日的出口：\n允許自己慢半拍'
];

function regenerateGalleryPoem(artId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  var entry = (S.diary || []).find(function (d) { return String(d.id) === String(artId); });
  if (!entry) return;
  var art = galleryArtworkView(entry, meta);
  var poem = generateGalleryPoem(
    { id: String(artId) + '_' + Date.now() },
    art.emotionLabels,
    art.moodStyle
  );
  meta.poem = poem;
  meta.note = poem;
  meta.poemAuto = true;
  saveGalleryStore(store);
  renderEmotionGallery();
  openGalleryDetail(artId);
  if (typeof showToast === 'function') showToast('已換一則短詩');
}

function openGalleryFrameEditor(artId) {
  artId = String(artId);
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  var host = document.getElementById('gal-detail-root');
  if (!host) return;
  _galleryState.detailId = artId;
  var colorBtns = GALLERY_FRAME_COLORS.map(function (c) {
    var on = (meta.frameColor || 'ivory') === c.id ? ' on' : '';
    return '<button type="button" class="gal-swatch' + on + '" style="--sw:' + c.hex + '" ' +
      'onclick="setGalleryFrameColor(\'' + artId + '\',\'' + c.id + '\')" aria-label="' + c.label + '" title="' + c.label + '"></button>';
  }).join('');
  var matBtns = GALLERY_FRAME_MATERIALS.map(function (m) {
    var on = (meta.frameMaterial || 'wood') === m.id ? ' on' : '';
    return '<button type="button" class="gal-tool' + on + '" onclick="setGalleryFrameMaterial(\'' + artId + '\',\'' + m.id + '\')">' +
      m.label + '</button>';
  }).join('');
  var previewCls = 'gal-frame-preview gal-mat-' + (meta.frameMaterial || 'wood') + ' gal-col-' + (meta.frameColor || 'ivory');
  var hex = (GALLERY_FRAME_COLORS.find(function (c) { return c.id === meta.frameColor; }) || GALLERY_FRAME_COLORS[0]).hex;

  host.classList.add('show');
  host.innerHTML =
    '<div class="gal-detail-mask" onclick="closeGalleryPoemEditor()"></div>' +
    '<div class="gal-poem-sheet" role="dialog" aria-modal="true">' +
      '<button type="button" class="gal-detail-close" onclick="closeGalleryPoemEditor()" aria-label="關閉">×</button>' +
      '<h2 class="gal-detail-title">畫框樣式</h2>' +
      '<p class="gal-poem-hint">挑選外框顏色與材質；變更會即時預覽並自動儲存。</p>' +
      '<div class="' + previewCls + '" id="gal-frame-preview" style="--gal-frame-c:' + hex + '"><span>預覽</span></div>' +
      '<p class="gal-poem-label">顏色</p>' +
      '<div class="gal-swatch-row">' + colorBtns + '</div>' +
      '<p class="gal-poem-label">材質</p>' +
      '<div class="gal-detail-actions">' + matBtns + '</div>' +
      '<div class="gal-detail-actions" style="margin-top:16px">' +
        '<button type="button" class="gal-tool on" onclick="closeGalleryPoemEditor()">完成並套用</button>' +
      '</div>' +
    '</div>';
}

function setGalleryFrameColor(artId, colorId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  meta.frameColor = colorId;
  saveGalleryStore(store);
  openGalleryFrameEditor(artId);
}

function setGalleryFrameMaterial(artId, matId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  meta.frameMaterial = matId;
  saveGalleryStore(store);
  openGalleryFrameEditor(artId);
}

function editGalleryCaption(artId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  var entry = (S.diary || []).find(function (d) { return String(d.id) === String(artId); });
  var art = galleryArtworkView(entry || { id: artId }, meta);
  if (!art.poem) {
    art.poem = ensureArtworkPoem(store, entry || { id: artId, emotions: [] }, art);
    saveGalleryStore(store);
  }
  var host = document.getElementById('gal-detail-root');
  if (!host) return;
  var hint = (art.emotionLabels && art.emotionLabels[0])
    ? ('目前依「' + art.emotionLabels[0] + '」生成。可改寫成你的小絕句，或 30 字以內短詩。')
    : '可改寫成你的小絕句，或 30 字以內短詩。';
  var sample = GALLERY_POEM_PROMPTS[Math.floor(Math.random() * GALLERY_POEM_PROMPTS.length)];

  host.classList.add('show');
  host.innerHTML =
    '<div class="gal-detail-mask" onclick="closeGalleryPoemEditor()"></div>' +
    '<div class="gal-poem-sheet" role="dialog" aria-modal="true" aria-labelledby="gal-poem-heading">' +
      '<button type="button" class="gal-detail-close" onclick="closeGalleryPoemEditor()" aria-label="關閉">×</button>' +
      '<p class="gal-detail-date">' + escapeGal(art.dateLabel) + '</p>' +
      '<h2 id="gal-poem-heading" class="gal-detail-title">改寫詩句</h2>' +
      '<p class="gal-poem-hint">' + escapeGal(hint) + '</p>' +
      '<label class="gal-poem-label" for="gal-poem-title">銘牌標題</label>' +
      '<input id="gal-poem-title" class="gal-poem-input" type="text" maxlength="28" value="' + escapeGal(meta.title || art.title) + '">' +
      '<label class="gal-poem-label" for="gal-poem-text">小絕句／短詩（最多 ' + GALLERY_POEM_MAX + ' 字）</label>' +
      '<textarea id="gal-poem-text" class="gal-poem-area" maxlength="' + GALLERY_POEM_MAX + '" rows="3" placeholder="' + escapeGal(sample) + '">' +
        escapeGal(meta.poem || '') +
      '</textarea>' +
      '<div class="gal-poem-meta">' +
        '<span id="gal-poem-count">0 / ' + GALLERY_POEM_MAX + '</span>' +
        '<button type="button" class="gal-poem-sample" onclick="regenerateGalleryPoemIntoEditor(\'' + artId + '\')">換一則靈感</button>' +
      '</div>' +
      '<div class="gal-detail-actions" style="margin-top:14px">' +
        '<button type="button" class="gal-tool on" onclick="saveGalleryPoem(\'' + art.id + '\')">掛上銘牌</button>' +
        '<button type="button" class="gal-tool" onclick="closeGalleryPoemEditor()">取消</button>' +
      '</div>' +
    '</div>';

  var ta = document.getElementById('gal-poem-text');
  var count = document.getElementById('gal-poem-count');
  function syncCount() {
    if (!ta || !count) return;
    var n = Array.from(ta.value).length;
    count.textContent = n + ' / ' + GALLERY_POEM_MAX;
    count.classList.toggle('gal-poem-over', n > GALLERY_POEM_MAX);
  }
  if (ta) {
    ta.addEventListener('input', syncCount);
    syncCount();
    setTimeout(function () { ta.focus(); }, 80);
  }
  _galleryState.detailId = artId;
  _galleryState._poemEditing = true;
}

function regenerateGalleryPoemIntoEditor(artId) {
  var store = loadGalleryStore();
  var entry = (S.diary || []).find(function (d) { return String(d.id) === String(artId); }) || { id: artId };
  var art = galleryArtworkView(entry, store.artworksMeta[artId] || {});
  var poem = generateGalleryPoem({ id: String(artId) + '_' + Date.now() }, art.emotionLabels, art.moodStyle);
  var ta = document.getElementById('gal-poem-text');
  if (!ta) return;
  ta.value = poem;
  ta.dispatchEvent(new Event('input'));
}

function fillGalleryPoemSample() {
  var ta = document.getElementById('gal-poem-text');
  if (!ta) return;
  var sample = GALLERY_POEM_PROMPTS[Math.floor(Math.random() * GALLERY_POEM_PROMPTS.length)];
  ta.value = Array.from(sample).slice(0, GALLERY_POEM_MAX).join('');
  ta.dispatchEvent(new Event('input'));
}

function saveGalleryPoem(artId) {
  var titleEl = document.getElementById('gal-poem-title');
  var ta = document.getElementById('gal-poem-text');
  if (!ta) return;
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  meta.title = String(titleEl ? titleEl.value : '').trim().slice(0, 28);
  var poem = Array.from(String(ta.value || '').trim()).slice(0, GALLERY_POEM_MAX).join('');
  if (!poem) {
    var entry = (S.diary || []).find(function (d) { return String(d.id) === String(artId); });
    poem = generateGalleryPoem(entry || { id: artId }, galleryArtworkView(entry || { id: artId }, meta).emotionLabels, (entry && entry.moodCat) || 'positive');
    meta.poemAuto = true;
  } else {
    meta.poemAuto = false;
  }
  meta.poem = poem;
  meta.note = poem;
  saveGalleryStore(store);
  _galleryState._poemEditing = false;
  renderEmotionGallery();
  openGalleryDetail(artId);
  if (typeof showToast === 'function') showToast('詩句已掛上銘牌');
}

function closeGalleryPoemEditor() {
  _galleryState._poemEditing = false;
  if (_galleryState.detailId) {
    renderEmotionGallery();
    openGalleryDetail(_galleryState.detailId);
  } else {
    closeGalleryDetail();
  }
}

function addGalleryLabel(artId) {
  var text = window.prompt('貼上標籤（情緒詞或短語）', '');
  if (text == null) return;
  text = String(text).trim().slice(0, 12);
  if (!text) return;
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  if (!meta.labels) meta.labels = [];
  meta.labels.push({
    id: 'lb_' + Date.now(),
    text: text,
    type: 'phrase',
    x: 6 + Math.random() * 50,
    y: 78 + Math.random() * 12
  });
  saveGalleryStore(store);
  renderEmotionGallery();
  openGalleryDetail(artId);
}

function editGalleryLabel(artId, labelId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  var lb = (meta.labels || []).find(function (l) { return l.id === labelId; });
  if (!lb) return;
  var next = window.prompt('編輯標籤（清空則刪除）', lb.text);
  if (next == null) return;
  next = String(next).trim().slice(0, 12);
  if (!next) {
    meta.labels = meta.labels.filter(function (l) { return l.id !== labelId; });
  } else {
    lb.text = next;
  }
  saveGalleryStore(store);
  renderEmotionGallery();
}

function removeGalleryLabel(artId, labelId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  meta.labels = (meta.labels || []).filter(function (l) { return l.id !== labelId; });
  saveGalleryStore(store);
  openGalleryDetail(artId);
}

function toggleGalleryPin(artId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  var pinnedCount = Object.keys(store.artworksMeta).filter(function (id) {
    return store.artworksMeta[id] && store.artworksMeta[id].pinned;
  }).length;
  if (!meta.pinned && pinnedCount >= 3) {
    if (typeof showToast === 'function') showToast('最多釘選 3 幅主視覺');
    return;
  }
  meta.pinned = !meta.pinned;
  saveGalleryStore(store);
  renderEmotionGallery();
  openGalleryDetail(artId);
}

function toggleGalleryHidden(artId) {
  var store = loadGalleryStore();
  var meta = ensureArtMeta(store, artId);
  meta.hidden = !meta.hidden;
  saveGalleryStore(store);
  closeGalleryDetail();
  renderEmotionGallery();
}

/* ── 情緒紀錄片（最多 7 幅） ── */

function clearGalleryDocuTimers() {
  (_galleryDocu.timers || []).forEach(function (t) { clearTimeout(t); });
  _galleryDocu.timers = [];
}

function galleryDocuLater(fn, ms) {
  var id = setTimeout(fn, ms);
  _galleryDocu.timers.push(id);
  return id;
}

function collectGalleryDocumentaryPieces() {
  var store = loadGalleryStore();
  var selected = syncGalleryArtworks(store);
  var byId = {};
  selected.forEach(function (e) { byId[String(e.id)] = e; });
  var pieces = [];
  var layout = (store.exhibition.layout || []).slice().sort(function (a, b) {
    return (a.slotIndex || 0) - (b.slotIndex || 0);
  });
  layout.forEach(function (L) {
    if (pieces.length >= 7) return;
    var entry = byId[String(L.artworkId)];
    if (!entry) return;
    var art = galleryArtworkView(entry, store.artworksMeta[entry.id]);
    art.poem = ensureArtworkPoem(store, entry, art);
    pieces.push({ entry: entry, art: art });
  });
  saveGalleryStore(store);
  return pieces;
}

function ensureGalleryDocuMusic() {
  var store = loadGalleryStore();
  var musicId = store.exhibition.musicId || GALLERY_MUSIC_DEFAULT;
  var audio = getGalleryAudioEl();
  if (musicId === 'none') {
    _galleryDocu.tempMusic = true;
    startGalleryMusicFadeIn(GALLERY_MUSIC_DEFAULT);
    return;
  }
  _galleryDocu.tempMusic = false;
  if (audio.paused || !audio.src) {
    startGalleryMusicFadeIn();
  }
}

function startGalleryDocumentary() {
  if (_galleryDocu.active) return;
  if (typeof TOUR !== 'undefined' && TOUR.active) return;
  var pieces = collectGalleryDocumentaryPieces();
  if (!pieces.length) {
    if (typeof showToast === 'function') showToast('尚無心靈畫布，無法生成紀錄片');
    return;
  }
  var store = loadGalleryStore();
  var host = document.getElementById('s-gallery');
  if (!host) return;

  _galleryDocu.active = true;
  _galleryDocu.pieces = pieces;
  _galleryDocu.index = -1;
  _galleryDocu.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  clearGalleryDocuTimers();

  var existing = document.getElementById('gal-docu');
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.id = 'gal-docu';
  el.className = 'gal-docu' + (_galleryDocu.reduced ? ' gal-docu-reduced' : '');
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', '情緒紀錄片');
  el.innerHTML =
    '<div class="gal-docu-magic" id="gal-docu-magic" aria-hidden="true">' +
      '<div class="gal-docu-magic-glow" id="gal-docu-magic-glow"></div>' +
    '</div>' +
    '<button type="button" class="gal-docu-close" onclick="stopGalleryDocumentary()" aria-label="結束紀錄片">結束</button>' +
    '<div class="gal-docu-progress" aria-hidden="true"><i id="gal-docu-bar"></i></div>' +
    '<div class="gal-docu-stage" id="gal-docu-stage" onclick="advanceGalleryDocumentary()">' +
      '<div class="gal-docu-card" id="gal-docu-card">' +
        '<p class="gal-docu-kicker">情緒紀錄片</p>' +
        '<h2 class="gal-docu-heading">' + escapeGal(store.exhibition.title || '我的情緒藝廊') + '</h2>' +
        '<p class="gal-docu-sub">近 ' + pieces.length + ' 幅心靈畫布 · 慢慢看</p>' +
      '</div>' +
      '<div class="gal-docu-slide" id="gal-docu-slide" hidden>' +
        '<div class="gal-docu-visual" id="gal-docu-visual">' +
          '<canvas id="gal-docu-cv" width="800" height="500" aria-hidden="true"></canvas>' +
          '<div class="gal-docu-vignette" aria-hidden="true"></div>' +
        '</div>' +
        '<div class="gal-docu-copy" id="gal-docu-copy">' +
          '<p class="gal-docu-date" id="gal-docu-date"></p>' +
          '<p class="gal-docu-poem" id="gal-docu-poem"></p>' +
          '<p class="gal-docu-emos" id="gal-docu-emos"></p>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<p class="gal-docu-hint">點畫面可進入下一幕</p>';
  host.appendChild(el);
  document.body.classList.add('gal-docu-playing');
  bindGalleryDocuMagic(el);

  ensureGalleryDocuMusic();

  // 片頭淡入
  requestAnimationFrame(function () {
    el.classList.add('show');
    var card = document.getElementById('gal-docu-card');
    if (card) card.classList.add('on');
    updateGalleryDocuProgress(0);
  });

  var openMs = _galleryDocu.reduced ? 1600 : 4200;
  galleryDocuLater(function () {
    var card = document.getElementById('gal-docu-card');
    if (card) card.classList.remove('on');
    galleryDocuLater(function () {
      playGalleryDocuPiece(0);
    }, _galleryDocu.reduced ? 400 : 900);
  }, openMs);
}

function updateGalleryDocuProgress(idx) {
  var bar = document.getElementById('gal-docu-bar');
  if (!bar) return;
  var total = (_galleryDocu.pieces || []).length + 1; // +片尾
  var pct = Math.min(100, Math.round(((idx + 1) / (total + 1)) * 100));
  bar.style.width = pct + '%';
}

function paintGalleryDocuCanvas(piece) {
  var art = piece.art;
  var cv = document.getElementById('gal-docu-cv');
  if (!cv || !art) return;
  if (art.canvasDataUrl && typeof drawCanvasFromDataUrl === 'function') {
    drawCanvasFromDataUrl('gal-docu-cv', art.canvasDataUrl, 800, 500, art.emotionColors, art.moodStyle);
  } else if (typeof drawSavedCanvas === 'function') {
    drawSavedCanvas('gal-docu-cv', art.emotionColors, art.moodStyle, 800, 500, {
      seed: String(art.id) + art.moodStyle + '_docu'
    });
  }
}

function playGalleryDocuPiece(idx) {
  if (!_galleryDocu.active) return;
  var pieces = _galleryDocu.pieces || [];
  if (idx >= pieces.length) {
    playGalleryDocuEnding();
    return;
  }
  _galleryDocu.index = idx;
  updateGalleryDocuProgress(idx);

  var piece = pieces[idx];
  var art = piece.art;
  var card = document.getElementById('gal-docu-card');
  var slide = document.getElementById('gal-docu-slide');
  var visual = document.getElementById('gal-docu-visual');
  var copy = document.getElementById('gal-docu-copy');
  var dateEl = document.getElementById('gal-docu-date');
  var poemEl = document.getElementById('gal-docu-poem');
  var emosEl = document.getElementById('gal-docu-emos');
  if (!slide || !visual || !copy) return;

  if (card) {
    card.hidden = true;
    card.classList.remove('on', 'ending');
  }
  slide.hidden = false;
  slide.classList.remove('on', 'with-text', 'out');
  visual.className = 'gal-docu-visual ken-' + (idx % 4);
  copy.classList.remove('on');

  if (dateEl) dateEl.textContent = art.dateLabel || art.title || '';
  if (poemEl) poemEl.innerHTML = escapeGal(String(art.poem || '').trim()).replace(/\n/g, '<br>');
  if (emosEl) {
    emosEl.textContent = (art.emotionLabels || []).slice(0, 3).join(' · ');
  }

  paintGalleryDocuCanvas(piece);

  var tTextIn = _galleryDocu.reduced ? 400 : 1000;
  var tHold = _galleryDocu.reduced ? 700 : 2600;
  var tTextOut = _galleryDocu.reduced ? 500 : 1100;
  var tFadeOut = _galleryDocu.reduced ? 500 : 1400;

  // 先出畫面
  requestAnimationFrame(function () {
    slide.classList.add('on');
  });

  // 再出文字
  galleryDocuLater(function () {
    if (!_galleryDocu.active || _galleryDocu.index !== idx) return;
    copy.classList.add('on');
    slide.classList.add('with-text');
  }, tTextIn);

  // 文字淡出
  galleryDocuLater(function () {
    if (!_galleryDocu.active || _galleryDocu.index !== idx) return;
    copy.classList.remove('on');
    slide.classList.remove('with-text');
  }, tTextIn + tHold);

  // 畫面淡出 → 下一幕
  galleryDocuLater(function () {
    if (!_galleryDocu.active || _galleryDocu.index !== idx) return;
    slide.classList.add('out');
    slide.classList.remove('on');
    galleryDocuLater(function () {
      playGalleryDocuPiece(idx + 1);
    }, tFadeOut);
  }, tTextIn + tHold + tTextOut);
}

function playGalleryDocuEnding() {
  if (!_galleryDocu.active) return;
  updateGalleryDocuProgress((_galleryDocu.pieces || []).length);
  var slide = document.getElementById('gal-docu-slide');
  var card = document.getElementById('gal-docu-card');
  if (slide) {
    slide.hidden = true;
    slide.classList.remove('on', 'with-text', 'out');
  }
  if (card) {
    card.hidden = false;
    card.classList.add('ending');
    card.innerHTML =
      '<p class="gal-docu-kicker">完</p>' +
      '<h2 class="gal-docu-heading">感謝停留</h2>' +
      '<p class="gal-docu-sub">每一幅顏色，都是你曾真實走過的情緒</p>';
    requestAnimationFrame(function () {
      card.classList.add('on');
    });
  }
  var endMs = _galleryDocu.reduced ? 1800 : 4200;
  galleryDocuLater(function () {
    stopGalleryDocumentary();
  }, endMs);
}

function advanceGalleryDocumentary() {
  if (!_galleryDocu.active) return;
  var endCard = document.getElementById('gal-docu-card');
  if (endCard && endCard.classList.contains('ending')) {
    stopGalleryDocumentary();
    return;
  }
  clearGalleryDocuTimers();
  var idx = _galleryDocu.index;
  if (idx < 0) {
    // 跳過片頭
    var card = document.getElementById('gal-docu-card');
    if (card) card.classList.remove('on');
    galleryDocuLater(function () { playGalleryDocuPiece(0); }, 350);
    return;
  }
  if (idx >= (_galleryDocu.pieces || []).length - 1) {
    playGalleryDocuEnding();
    return;
  }
  var slide = document.getElementById('gal-docu-slide');
  if (slide) {
    slide.classList.add('out');
    slide.classList.remove('on', 'with-text');
  }
  galleryDocuLater(function () {
    playGalleryDocuPiece(idx + 1);
  }, _galleryDocu.reduced ? 300 : 700);
}

function stopGalleryDocumentary(fromExit) {
  if (!_galleryDocu.active && !document.getElementById('gal-docu')) {
    return;
  }
  clearGalleryDocuTimers();
  if (typeof _galleryDocu.magicCleanup === 'function') {
    _galleryDocu.magicCleanup();
    _galleryDocu.magicCleanup = null;
  }
  _galleryDocu.active = false;
  _galleryDocu.index = -1;
  _galleryDocu.pieces = [];
  document.body.classList.remove('gal-docu-playing');
  var el = document.getElementById('gal-docu');
  if (el) {
    el.classList.remove('show');
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 450);
  }
  if (_galleryDocu.tempMusic) {
    _galleryDocu.tempMusic = false;
    if (!fromExit) fadeOutGalleryMusic(800);
  }
}

function bindGalleryDocuMagic(root) {
  if (!root || _galleryDocu.reduced) return;
  var layer = document.getElementById('gal-docu-magic');
  var glow = document.getElementById('gal-docu-magic-glow');
  _galleryDocu.magicCleanup = bindGalleryMagicTrail(root, {
    layer: layer,
    glow: glow,
    isActive: function () { return !!_galleryDocu.active; }
  });
}

function unbindGalleryViewMagic() {
  if (typeof _galleryViewMagicCleanup === 'function') {
    _galleryViewMagicCleanup();
    _galleryViewMagicCleanup = null;
  }
}

function bindGalleryViewMagic(root) {
  unbindGalleryViewMagic();
  if (!root) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || root.classList.contains('gal-reduced')) return;
  var layer = document.getElementById('gal-view-magic');
  var glow = document.getElementById('gal-view-magic-glow');
  _galleryViewMagicCleanup = bindGalleryMagicTrail(root, {
    layer: layer,
    glow: glow,
    isActive: function () {
      // 紀錄片播放時改由紀錄片層負責
      return !_galleryDocu.active && !!document.getElementById('gallery-root');
    }
  });
}

/** 金色魔法光軌（觀展／紀錄片共用） */
function bindGalleryMagicTrail(root, opts) {
  opts = opts || {};
  var layer = opts.layer;
  var glow = opts.glow;
  if (!root || !layer || !glow) return null;
  var isActive = typeof opts.isActive === 'function' ? opts.isActive : function () { return true; };
  var lastSpawn = 0;
  var sparkCount = 0;

  function spawnSpark(x, y) {
    if (sparkCount > 40) return;
    var spark = document.createElement('i');
    var kind = sparkCount % 5 === 0 ? ' cross' : (sparkCount % 3 === 0 ? ' mote' : '');
    var size = 3 + Math.floor(Math.random() * 5);
    var dx = (Math.random() - 0.5) * 28;
    var dy = (Math.random() - 0.5) * 28 - 8;
    spark.className = 'gal-docu-spark' + kind;
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.setProperty('--dx', dx + 'px');
    spark.style.setProperty('--dy', dy + 'px');
    layer.appendChild(spark);
    sparkCount++;
    setTimeout(function () {
      if (spark.parentNode) spark.parentNode.removeChild(spark);
      sparkCount = Math.max(0, sparkCount - 1);
    }, 900);
  }

  function pointFromEvent(e) {
    var cx = e.clientX;
    var cy = e.clientY;
    if ((cx == null || cy == null) && e.touches && e.touches[0]) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    }
    if (cx == null && e.changedTouches && e.changedTouches[0]) {
      cx = e.changedTouches[0].clientX;
      cy = e.changedTouches[0].clientY;
    }
    return { x: cx, y: cy };
  }

  function onMove(e) {
    if (!isActive()) return;
    var pt = pointFromEvent(e);
    if (pt.x == null) return;
    var rect = root.getBoundingClientRect();
    var x = pt.x - rect.left;
    var y = pt.y - rect.top;
    glow.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    glow.classList.add('on');

    var now = Date.now();
    if (now - lastSpawn < 22) return;
    lastSpawn = now;
    spawnSpark(x, y);
    if (Math.random() > 0.45) {
      spawnSpark(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 14);
    }
  }

  function onLeave() {
    glow.classList.remove('on');
  }

  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('pointerdown', onMove, { passive: true });
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointercancel', onLeave);
  // 觸控滑動展牆時補捉 touchmove（部分瀏覽器捲動中 pointer 較不穩）
  root.addEventListener('touchmove', onMove, { passive: true });

  return function cleanup() {
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerdown', onMove);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('pointercancel', onLeave);
    root.removeEventListener('touchmove', onMove);
    glow.classList.remove('on');
  };
}

