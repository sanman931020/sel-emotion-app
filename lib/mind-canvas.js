/**
 * 心靈畫布 — 依情緒心理學色票＋ moodCat 構圖（純 Canvas 2D，不呼叫生圖 API）
 */
var MOOD_CANVAS_BG = {
  anger: '#FFF5F3',
  anxiety: '#FFF8F3',
  sad: '#F3F6FA',
  self: '#F8F5FC',
  buffer: '#F7FAF9',
  positive: '#FFFBF2'
};

function mindArtRand(seed, i) {
  var x = Math.sin((seed || 1) * 12.9898 + (i || 0) * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function mindHexToRgb(hex) {
  var h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length === 8) h = h.slice(0, 6);
  var n = parseInt(h, 16);
  if (isNaN(n)) return { r: 139, g: 125, b: 184 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mindCanvasColor(hex, a) {
  var rgb = mindHexToRgb(hex);
  return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')';
}

function mindIsPurpleFear(hex) {
  var rgb = mindHexToRgb(hex);
  return rgb.b > rgb.r + 20 && rgb.b > rgb.g + 10 && rgb.r < 140;
}

function mindDensity(style, seed) {
  var ranges = {
    anger: [32, 40],
    anxiety: [28, 36],
    sad: [6, 12],
    self: [18, 26],
    buffer: [12, 18],
    positive: [18, 24]
  };
  var r = ranges[style] || ranges.positive;
  return r[0] + Math.floor(mindArtRand(seed, 3) * (r[1] - r[0] + 1));
}

function fillMoodCanvasBg(ctx, W, H, moodStyle, dark) {
  var bg = MOOD_CANVAS_BG[moodStyle] || MOOD_CANVAS_BG.positive;
  if (dark) {
    ctx.fillStyle = '#1A1E2C';
  } else {
    ctx.fillStyle = bg;
  }
  ctx.fillRect(0, 0, W, H);
}

function paintAnger(ctx, colors, W, H, seed, n) {
  var pad = Math.min(W, H) * 0.08;
  for (var i = 0; i < n; i++) {
    var col = colors[i % colors.length];
    var x = -pad + mindArtRand(seed, i) * (W + pad * 2);
    var y = -pad + mindArtRand(seed, i + 1) * (H + pad * 2);
    ctx.save();
    ctx.globalAlpha = 0.55 + mindArtRand(seed, i + 2) * 0.4;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5 + mindArtRand(seed, i + 3) * 5;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    var kind = Math.floor(mindArtRand(seed, i + 4) * 3);
    if (kind === 0) {
      var s = 12 + mindArtRand(seed, i + 5) * 28;
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.85, y + s * 0.7);
      ctx.lineTo(x - s * 0.85, y + s * 0.7);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 1) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (var j = 0; j < 4; j++) {
        ctx.lineTo(
          x + (mindArtRand(seed, i * 10 + j) - 0.5) * 70,
          y + (j + 1) * (8 + mindArtRand(seed, i + j) * 14)
        );
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 20, y - 20);
      ctx.lineTo(x + 20, y + 20);
      ctx.moveTo(x + 20, y - 20);
      ctx.lineTo(x - 20, y + 20);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function paintAnxiety(ctx, colors, W, H, seed, n) {
  var hasFear = colors.some(mindIsPurpleFear);
  if (hasFear) {
    colors.forEach(function (col, ci) {
      if (!mindIsPurpleFear(col)) return;
      ctx.save();
      ctx.globalAlpha = 0.12 + mindArtRand(seed, ci) * 0.1;
      ctx.fillStyle = col;
      var rw = W * (0.35 + mindArtRand(seed, ci + 2) * 0.35);
      var rh = H * (0.28 + mindArtRand(seed, ci + 3) * 0.3);
      var x = mindArtRand(seed, ci + 4) * (W - rw);
      var y = mindArtRand(seed, ci + 5) * H * 0.45;
      ctx.beginPath();
      ctx.ellipse(x + rw / 2, y + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  for (var i = 0; i < n; i++) {
    var col = colors[i % colors.length];
    var x = mindArtRand(seed, i) * W;
    var y = mindArtRand(seed, i + 1) * H * (hasFear ? 0.85 : 1);
    ctx.save();
    ctx.globalAlpha = 0.35 + mindArtRand(seed, i + 2) * 0.45;
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 1 + mindArtRand(seed, i + 3) * 2.2;
    var kind = Math.floor(mindArtRand(seed, i + 4) * 3);
    if (kind === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (var j = 0; j < 5; j++) {
        ctx.lineTo(x + j * 6 + mindArtRand(seed, i + j) * 4, y + (mindArtRand(seed, i + j + 10) - 0.5) * 14);
      }
      ctx.stroke();
    } else if (kind === 1) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + mindArtRand(seed, i + 5) * 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + 8, y + (mindArtRand(seed, i + 6) - 0.5) * 20,
        x + 16, y + (mindArtRand(seed, i + 7) - 0.5) * 20,
        x + 24, y + (mindArtRand(seed, i + 8) - 0.5) * 12
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}

function paintSad(ctx, colors, W, H, seed, n) {
  var ox = W * 0.35;
  var oy = H * 0.35;
  var aw = W * 0.55;
  var ah = H * 0.55;
  for (var i = 0; i < n; i++) {
    var col = colors[i % colors.length];
    var x = ox + mindArtRand(seed, i) * aw;
    var y = oy + mindArtRand(seed, i + 1) * ah;
    ctx.save();
    ctx.globalAlpha = 0.18 + mindArtRand(seed, i + 2) * 0.28;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 0.8 + mindArtRand(seed, i + 3) * 1.4;
    var kind = Math.floor(mindArtRand(seed, i + 4) * 3);
    if (kind === 0) {
      var rx = 4 + mindArtRand(seed, i + 5) * 10;
      var ry = 14 + mindArtRand(seed, i + 6) * 28;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 1) {
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (mindArtRand(seed, i + 7) - 0.3) * 20, y + 30 + mindArtRand(seed, i + 8) * 40);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 6, y + 18, x, y + 36);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function paintSelf(ctx, colors, W, H, seed, n) {
  var cx = W * (0.35 + mindArtRand(seed, 1) * 0.3);
  var cy = H * (0.35 + mindArtRand(seed, 2) * 0.3);
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = colors[colors.length - 1] || colors[0];
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(W, H) * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  try { ctx.globalCompositeOperation = 'multiply'; } catch (e) {}
  for (var i = 0; i < n; i++) {
    var col = colors[i % colors.length];
    var ang = mindArtRand(seed, i) * Math.PI * 2;
    var rad = mindArtRand(seed, i + 1) * Math.min(W, H) * 0.22;
    var x = cx + Math.cos(ang) * rad;
    var y = cy + Math.sin(ang) * rad;
    ctx.save();
    ctx.globalAlpha = 0.28 + mindArtRand(seed, i + 2) * 0.35;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.2;
    var kind = Math.floor(mindArtRand(seed, i + 3) * 3);
    if (kind === 0) {
      ctx.beginPath();
      ctx.arc(x, y, 3 + mindArtRand(seed, i + 4) * 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 1) {
      ctx.beginPath();
      ctx.arc(x, y, 8 + mindArtRand(seed, i + 5) * 12, mindArtRand(seed, i + 6) * Math.PI, mindArtRand(seed, i + 7) * Math.PI + 1.2);
      ctx.stroke();
    } else {
      ctx.globalAlpha *= 0.55;
      ctx.beginPath();
      ctx.arc(x, y, 10 + mindArtRand(seed, i + 8) * 14, 0, Math.PI * 1.2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function paintBuffer(ctx, colors, W, H, seed, n) {
  var cx = W / 2;
  var cy = H / 2;
  for (var i = 0; i < n; i++) {
    var col = colors[i % colors.length];
    var x = cx + (mindArtRand(seed, i) - 0.5) * W * 0.55;
    var y = cy + (mindArtRand(seed, i + 1) - 0.5) * H * 0.5;
    ctx.save();
    ctx.globalAlpha = 0.2 + mindArtRand(seed, i + 2) * 0.28;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5 + mindArtRand(seed, i + 3) * 2;
    ctx.lineCap = 'round';
    if (mindArtRand(seed, i + 4) > 0.45) {
      var r = 14 + mindArtRand(seed, i + 5) * 36;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, mindCanvasColor(col, 0.45));
      g.addColorStop(1, mindCanvasColor(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 20 + mindArtRand(seed, i + 6) * 30, 0.2, Math.PI * 1.4);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function paintPositive(ctx, colors, W, H, seed, n) {
  for (var i = 0; i < n; i++) {
    var col = colors[i % colors.length];
    var x = mindArtRand(seed, i) * W;
    var y = mindArtRand(seed, i + 1) * H;
    ctx.save();
    ctx.globalAlpha = 0.28 + mindArtRand(seed, i + 2) * 0.4;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5 + mindArtRand(seed, i + 3) * 2.5;
    ctx.lineCap = 'round';
    var kind = Math.floor(mindArtRand(seed, i + 4) * 3);
    if (kind === 0) {
      var r = 10 + mindArtRand(seed, i + 5) * 28;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 1) {
      var r0 = 8 + mindArtRand(seed, i + 6) * 16;
      for (var ring = 1; ring <= 3; ring++) {
        ctx.globalAlpha = 0.18 + ring * 0.08;
        ctx.beginPath();
        ctx.arc(x, y, r0 * ring * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + mindArtRand(seed, i + 7) * 40, y - 20,
        x + mindArtRand(seed, i + 8) * 60, y + 30,
        x + 40 + mindArtRand(seed, i + 9) * 40, y + (mindArtRand(seed, i + 10) - 0.5) * 20
      );
      ctx.stroke();
    }
    ctx.restore();
  }
}

function softVeilCanvas(ctx, W, H) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,' + (0.12 + mindArtRand(W + H, 9) * 0.06) + ')';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * 在既有 2d context 上繪製心靈畫布
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} emotionColors
 * @param {string} moodStyle anger|anxiety|sad|self|buffer|positive
 * @param {number} W
 * @param {number} H
 * @param {object} [opts] { dark?: boolean, seed?: string|number }
 */
function generateMindPainting(ctx, emotionColors, moodStyle, W, H, opts) {
  opts = opts || {};
  var colors = (emotionColors && emotionColors.length) ? emotionColors.slice() : ['#FFD54F', '#81C784'];
  var style = moodStyle || 'positive';
  if (!MOOD_CANVAS_BG[style]) style = 'positive';
  var seed = opts.seed != null ? opts.seed : (colors.join('') + style);
  if (typeof seed === 'string') {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973;
    seed = h || 1;
  }
  fillMoodCanvasBg(ctx, W, H, style, !!opts.dark);
  var n = mindDensity(style, seed);
  if (style === 'anger') paintAnger(ctx, colors, W, H, seed, n);
  else if (style === 'anxiety') paintAnxiety(ctx, colors, W, H, seed, n);
  else if (style === 'sad') paintSad(ctx, colors, W, H, seed, n);
  else if (style === 'self') paintSelf(ctx, colors, W, H, seed, n);
  else if (style === 'buffer') paintBuffer(ctx, colors, W, H, seed, n);
  else paintPositive(ctx, colors, W, H, seed, n);
  softVeilCanvas(ctx, W, H);
}

/**
 * 將儲存的色票／風格重繪到指定 canvas 元素
 */
function drawSavedCanvas(id, colors, style, W, H, opts) {
  var cv = document.getElementById(id);
  if (!cv) return false;
  var stage = cv.closest && cv.closest('.canvas-stage');
  var rect = cv.getBoundingClientRect ? cv.getBoundingClientRect() : { width: 0, height: 0 };
  W = W || Math.round(rect.width) || (stage && stage.clientWidth) || cv.clientWidth || cv.offsetWidth || 0;
  H = H || Math.round(rect.height) || (stage && Math.round(stage.clientWidth * 0.625)) || cv.clientHeight || cv.offsetHeight || 0;
  if (W < 50 && stage) {
    var sw = stage.clientWidth || stage.offsetWidth || 0;
    if (sw > 50) { W = sw; H = Math.round(sw * 0.625); }
  }
  if (W < 50) { W = 280; H = 175; }
  cv.width = W;
  cv.height = H;
  cv.style.width = '100%';
  cv.style.height = '100%';
  var ctx = cv.getContext('2d');
  if (!ctx) return false;
  generateMindPainting(ctx, colors, style, W, H, opts);
  return true;
}
