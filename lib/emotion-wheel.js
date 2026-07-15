/**
 * 情緒輪盤 UI — 六大情緒區（含負向／複雜／正向），以角度點選
 */
var _wheel = { selectedCat: null, viewMode: 'grid' };

var WHEEL_CAT_ICONS = {
  high_neg_anger: '😤',
  high_neg_anxiety: '😰',
  low_neg_sadness: '😢',
  complex_self: '🪞',
  buffer_positive: '🌿',
  positive_emotions: '😊'
};

function toggleEmotionView(mode) {
  _wheel.viewMode = mode === 'wheel' ? 'wheel' : 'grid';
  if (typeof ciRender === 'function') ciRender();
}

function renderEmotionWheel() {
  var cats = (SEL_INDEX && SEL_INDEX.emoCategories) ? SEL_INDEX.emoCategories.slice() : [];
  var html = '<div class="emo-view-toggle mb14">' +
    '<button type="button" class="emo-view-btn' + (_wheel.viewMode === 'grid' ? ' on' : '') + '" onclick="toggleEmotionView(\'grid\')">標籤模式</button>' +
    '<button type="button" class="emo-view-btn' + (_wheel.viewMode === 'wheel' ? ' on' : '') + '" onclick="toggleEmotionView(\'wheel\')">情緒輪盤</button>' +
    '</div>';

  if (_wheel.viewMode === 'grid') {
    return html +
      '<p class="f13 t2 mb12" style="line-height:1.7">可多選；點選標籤即可加入／取消。</p>' +
      renderEmotionGrid();
  }

  if (!cats.length) {
    return html + '<p class="f13 t3 center">尚無情緒分類資料</p>';
  }

  var segAngle = 360 / cats.length;
  var stops = [];
  cats.forEach(function (cat, i) {
    var col = (cat.colors && cat.colors.primary) || '#c8b8a8';
    var a0 = (i * segAngle).toFixed(2);
    var a1 = ((i + 1) * segAngle).toFixed(2);
    stops.push(col + ' ' + a0 + 'deg', col + ' ' + a1 + 'deg');
  });
  var wheelBg = 'conic-gradient(from -90deg, ' + stops.join(', ') + ')';

  var labels = cats.map(function (cat, i) {
    var mid = -90 + i * segAngle + segAngle / 2;
    var rad = (mid * Math.PI) / 180;
    var r = 38;
    var x = 50 + Math.cos(rad) * r;
    var y = 50 + Math.sin(rad) * r;
    var sel = _wheel.selectedCat === cat.id;
    return '<button type="button" class="wheel-label' + (sel ? ' sel' : '') + '" ' +
      'style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%" ' +
      'onclick="event.stopPropagation();selectWheelCategory(\'' + cat.id + '\')" ' +
      'aria-label="' + escapeWheelHtml(cat.name) + '">' +
      (WHEEL_CAT_ICONS[cat.id] || '◆') +
      '</button>';
  }).join('');

  var legend = '<div class="wheel-legend">' + cats.map(function (cat) {
    var col = (cat.colors && cat.colors.primary) || 'var(--acc)';
    var sel = _wheel.selectedCat === cat.id;
    var short = shortWheelCatName(cat.name);
    return '<button type="button" class="wheel-legend-item' + (sel ? ' sel' : '') + '" ' +
      'onclick="selectWheelCategory(\'' + cat.id + '\')">' +
      '<span class="wheel-legend-dot" style="background:' + col + '"></span>' +
      '<span>' + escapeWheelHtml(short) + '</span></button>';
  }).join('') + '</div>';

  var panel = '';
  if (_wheel.selectedCat) {
    var tags = SEL_INDEX.tagsByEmoCat[_wheel.selectedCat] || [];
    var catMeta = SEL_INDEX.emotionCatById[_wheel.selectedCat] || {};
    panel = '<div class="wheel-tag-panel">' +
      '<p class="f13 fw5 mb8">' + escapeWheelHtml(catMeta.name || '') + '</p>' +
      '<p class="f12 t3 mb10">可多選；再點一次可取消</p>' +
      '<div class="etag-grid">' + tags.map(function (t) {
        var sel = S.emotionIds.indexOf(t.id) >= 0;
        var em = typeof resolveEmotion === 'function' ? resolveEmotion(t.id) : null;
        var col = em ? em.color : 'var(--acc)';
        var bg = em ? em.bg : 'var(--acc-l)';
        return '<button type="button" class="etag" style="' + (sel ? 'background:' + bg + ';border-color:' + col + ';color:' + col + ';font-weight:600' : 'border-color:' + col + ';color:' + col) + '" ' +
          'onclick="toggleEmotion(\'' + t.id + '\',this)">' + escapeWheelHtml(t.label) + '</button>';
      }).join('') + '</div></div>';
  } else {
    panel = '<p class="f13 t2 center wheel-hint">先點輪盤色塊或下方圖例，再選具體情緒（可多選）</p>';
  }

  return html +
    '<div class="emotion-wheel-wrap">' +
      '<p class="wheel-howto f13 t2 mb12" style="line-height:1.75">' +
        '<strong style="color:var(--t1);font-weight:600">怎麼選：</strong>' +
        '情緒輪盤分成六區（憤怒、焦慮、悲傷、複雜自我、緩衝正向、正向）。' +
        '點選色塊或圖例 → 下方出現該區情緒標籤 → 可多選。也可改用上方「標籤模式」一次瀏覽全部。' +
      '</p>' +
      '<div class="emotion-wheel" role="img" aria-label="情緒輪盤，點選扇區選擇情緒類別" ' +
        'style="background:' + wheelBg + '" ' +
        'onclick="onEmotionWheelClick(event)">' +
        labels +
        '<div class="wheel-center" aria-hidden="true">🎡</div>' +
      '</div>' +
      legend +
      panel +
    '</div>';
}

function shortWheelCatName(name) {
  var n = String(name || '');
  if (n.indexOf('憤怒') >= 0) return '憤怒';
  if (n.indexOf('焦慮') >= 0) return '焦慮';
  if (n.indexOf('悲傷') >= 0) return '悲傷';
  if (n.indexOf('複雜') >= 0 || n.indexOf('自我') >= 0) return '複雜自我';
  if (n.indexOf('緩衝') >= 0 || n.indexOf('微弱') >= 0) return '緩衝正向';
  if (n.indexOf('正向') >= 0) return '正向';
  return n.length > 8 ? n.slice(0, 8) + '…' : n;
}

function onEmotionWheelClick(e) {
  var cats = (SEL_INDEX && SEL_INDEX.emoCategories) ? SEL_INDEX.emoCategories : [];
  if (!cats.length) return;
  var wheel = e.currentTarget;
  var rect = wheel.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var dx = e.clientX - cx;
  var dy = e.clientY - cy;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < rect.width * 0.16) return; // 中心圓不選
  // 與 conic-gradient(from -90deg) 對齊：0° = 上方，順時針
  var angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;
  var segAngle = 360 / cats.length;
  var idx = Math.floor(angle / segAngle) % cats.length;
  if (idx < 0) idx += cats.length;
  selectWheelCategory(cats[idx].id);
}

function renderEmotionGrid() {
  var cats = (SEL_INDEX && SEL_INDEX.emoCategories) ? SEL_INDEX.emoCategories : [];
  if (cats.length) {
    return cats.map(function (cat) {
      var tags = SEL_INDEX.tagsByEmoCat[cat.id] || [];
      var col = (cat.colors && cat.colors.primary) || 'var(--acc)';
      return '<div class="etag-cat">' +
        '<p class="etag-cat-hd"><span class="etag-cat-dot" style="background:' + col + '"></span>' +
        escapeWheelHtml(cat.name) + '</p>' +
        '<div class="etag-grid">' + tags.map(function (t) {
          var sel = S.emotionIds.indexOf(t.id) >= 0;
          var em = typeof resolveEmotion === 'function' ? resolveEmotion(t.id) : null;
          var c = em ? em.color : col;
          var bg = em ? em.bg : 'var(--acc-l)';
          return '<button type="button" class="etag" style="' + (sel ? 'background:' + bg + ';border-color:' + c + ';color:' + c + ';font-weight:600' : 'border-color:' + c + ';color:' + c) + '" ' +
            'onclick="toggleEmotion(\'' + t.id + '\',this)" data-id="' + t.id + '">' + escapeWheelHtml(t.label) + '</button>';
        }).join('') + '</div></div>';
    }).join('');
  }
  var allEmo = (SEL_DATA && SEL_DATA.emotionTaxonomy && SEL_DATA.emotionTaxonomy.tags)
    ? SEL_DATA.emotionTaxonomy.tags.slice().sort(function (a, b) {
      return a.label.localeCompare(b.label, 'zh-Hant');
    })
    : [];
  return '<div class="etag-grid">' + allEmo.map(function (t) {
    var sel = S.emotionIds.indexOf(t.id) >= 0;
    var em = typeof resolveEmotion === 'function' ? resolveEmotion(t.id) : null;
    var col = em ? em.color : 'var(--acc)';
    var bg = em ? em.bg : 'var(--acc-l)';
    return '<button type="button" class="etag" style="' + (sel ? 'background:' + bg + ';border-color:' + col + ';color:' + col + ';font-weight:600' : 'border-color:' + col + ';color:' + col) + '" ' +
      'onclick="toggleEmotion(\'' + t.id + '\',this)" data-id="' + t.id + '">' + escapeWheelHtml(t.label) + '</button>';
  }).join('') + '</div>';
}

function selectWheelCategory(catId) {
  _wheel.selectedCat = _wheel.selectedCat === catId ? null : catId;
  if (typeof ciRender === 'function') ciRender();
}

function escapeWheelHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
