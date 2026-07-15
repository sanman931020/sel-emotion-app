/**
 * 情境角色扮演 — I-message 教學、多變情境、和諧度儀表
 */
var SCENARIO_THEMES = [
  {
    id: 'say_no',
    title: '對朋友說不',
    icon: '🙅',
    desc: '在關係中練習溫和拒絕，不委屈自己。',
    variants: [
      {
        partnerName: '阿凱',
        context: '同組報告',
        opening: '欸，這週末可以再幫我趕一次報告嗎？上次真的超感謝你！',
        hints: { feel: '有點為難', when: '再次提出同樣請求', because: '我這週也需要休息' },
        replies: {
          neutral: ['可是這次真的很急，禮拜一就要交了欸。', '我知道你很忙，但這次真的只差最後一段。', '那不然你幫我看看大綱就好？'],
          good: ['嗯…也對，是我一直麻煩你。', '好，我聽懂了，我再去問問別人。', '謝謝你願意說，我會自己想辦法。'],
          great: ['好，我理解了。也許我可以先跟教授申請延期。', '你說得對，我不該每次都找你。我們再想別的方式。'],
          bad: ['你以前都會幫我啊，怎麼這次不行？', '算了，我找別人就好。（語氣冷淡）']
        }
      },
      {
        partnerName: '小芬',
        context: '社群活動',
        opening: '今晚揪局你又不來？大家都要到了，就差你一個。',
        hints: { feel: '有點壓力', when: '一直要我出席每次聚會', because: '我最近真的需要一點自己的時間' },
        replies: {
          neutral: ['可是大家很久沒見了耶，來一下嘛。', '你最近是不是在躲我們？', '那下次你一定要來喔。'],
          good: ['好，我懂了，不是不想見你們。', '嗯，你願意說出來比較好，我不逼你了。'],
          great: ['謝謝你告訴我，我會跟大家解釋。你想什麼時候比較方便再約？'],
          bad: ['隨便啦，那你以後都別來。', '真掃興，大家都這樣想你了。']
        }
      },
      {
        partnerName: '學長',
        context: '社團跑腿',
        opening: '下週活動你能幫忙搬器材嗎？上次你做得不錯，這次也靠你了。',
        hints: { feel: '有點負擔', when: '預設我會答應幫忙', because: '我下週有重要考試要準備' },
        replies: {
          neutral: ['就兩個小時而已，應該還好吧？', '可是缺人手，你能不能再撐一下？'],
          good: ['好，我了解了，我再去協調其他人。', '考試優先，我會跟幹部說。'],
          great: ['謝謝你提前說，我來調整人力安排。'],
          bad: ['當幹部不是本來就要付出嗎？', '大家都有課業啊，為什麼就你不行。']
        }
      }
    ]
  },
  {
    id: 'feedback',
    title: '面對負面回饋',
    icon: '💬',
    desc: '收到批評時，練習表達感受而非反擊。',
    variants: [
      {
        partnerName: '王老師',
        context: '課堂報告',
        opening: '這份報告的論述不夠清楚，口條也偏快，你需要再加強。',
        hints: { feel: '有點受挫', when: '在全班前這樣評論', because: '我其實準備了很久' },
        replies: {
          neutral: ['那你可以具體說哪裡需要改嗎？', '我是就事論事，不是針對你。'],
          good: ['謝謝你願意回應，我們可以下課再聊細節。', '我聽到你的努力了，我們一起看怎麼調整。'],
          great: ['願意說出感受很好。下週前給我一版修改大綱，我陪你對。'],
          bad: ['接受意見也是學習的一部分。', '你這態度將來出社會會吃虧。']
        }
      },
      {
        partnerName: '主管 Amy',
        context: '實習考核',
        opening: '你這週的進度落後了，會議上怎麼沒主動報告？',
        hints: { feel: '有點緊張', when: '在會議上直接點名', because: '我還在等資料才能彙整' },
        replies: {
          neutral: ['那資料什麼時候會到？你要主動追。', '職場上不能等別人給。'],
          good: ['好，我了解卡在哪了，我們對一下時程。', '你願意說比悶著好，我們調整分工。'],
          great: ['謝謝你說清楚，我來幫你跟對方窗口溝通。'],
          bad: ['實習生本來就要更積極。', '這不是藉口。']
        }
      },
      {
        partnerName: '隊友阿哲',
        context: '專題分工',
        opening: '你負責的部分品質不行，這樣我們整組都要被拖下水。',
        hints: { feel: '很委屈', when: '在群組裡公開指責', because: '很多資料是照你之前確認的方向做的' },
        replies: {
          neutral: ['那你想怎樣？ deadline 快到了。', '現在不是追究的時候吧。'],
          good: ['好，我可能語氣重了，我們私訊對一下。', '聽起來我們對標準沒對齊。'],
          great: ['謝謝你沒有直接開罵，我們約十分鐘把標準講清楚。'],
          bad: ['你就是做不好還不讓人說？', '別找藉口了。']
        }
      }
    ]
  },
  {
    id: 'roommate',
    title: '與室友的衝突',
    icon: '🏠',
    desc: '生活習慣摩擦時，練習具體描述而非指責。',
    variants: [
      {
        partnerName: '室友小安',
        context: '冷氣與電費',
        opening: '你又把冷氣開整夜？電費很誇欸，能不能注意一下。',
        hints: { feel: '有點困擾', when: '深夜冷氣聲很大', because: '我睡眠很淺，而且分攤也會增加' },
        replies: {
          neutral: ['那你想怎樣？大家都有習慣不同啊。', '我怕熱，關掉我睡不著。'],
          good: ['好，我試試看定時關。', '我沒注意到吵到你，我們訂個共識吧。'],
          great: ['謝謝你直接說，我們來寫個簡單寢規？'],
          bad: ['你也可以戴耳塞啊。', '你太計較了吧。']
        }
      },
      {
        partnerName: '室友阿豪',
        context: '公共空間',
        opening: '客廳又堆滿你的外送盒，拜託用完收一下好嗎？',
        hints: { feel: '不舒服', when: '東西放超過兩天沒收', because: '我想在客廳念書' },
        replies: {
          neutral: ['我等等就收啦，不用一直講。', '我最近很忙耶。'],
          good: ['好，是我疏忽了，今晚處理。', '我會貼個提醒在冰箱。'],
          great: ['我們訂個「當天收」規則，互相提醒。'],
          bad: ['你又不是房東。', '那你也沒把碗洗好啊。']
        }
      },
      {
        partnerName: '室友 Mei',
        context: '作息差異',
        opening: '你凌晨兩點還在開視訊？聲音都傳到我這邊了。',
        hints: { feel: '很累', when: '深夜講話聲很明顯', because: '我隔天早上有課' },
        replies: {
          neutral: ['我壓很低了耶，你會不會太敏感？', '那不然你戴耳罩？'],
          good: ['好，我之後改到客廳或戴耳機。', '我沒想到會吵到你。'],
          great: ['我們訂個「十二點後輕聲」約定，寫在門上提醒。'],
          bad: ['這是宿舍欸，本來就會有聲音。', '你以前也會熬夜啊。']
        }
      }
    ]
  },
  {
    id: 'family',
    title: '與家人溝通',
    icon: '👨‍👩‍👧',
    desc: '面對關心或壓力時，練習說出自己的需要。',
    variants: [
      {
        partnerName: '媽媽',
        context: '未來規劃',
        opening: '你最近怎麼都不提研究所的事？是不是又拖著不想面對？',
        hints: { feel: '有壓力', when: '每次吃飯都問同樣問題', because: '我還在蒐集資料，需要時間想清楚' },
        replies: {
          neutral: ['我也是為你好，不然以後怎麼辦？', '你同學都開始準備了耶。'],
          good: ['好，媽媽不逼你，你想好了再說。', '我聽到了，是我太急。'],
          great: ['謝謝你願意講，下個月我們約一天專門聊計畫。'],
          bad: ['你就是逃避。', '我白擔心你了。']
        }
      },
      {
        partnerName: '爸爸',
        context: '成績與期待',
        opening: '這學期成績怎麼又掉？你到底有没有在讀書？',
        hints: { feel: '很沮喪', when: '一開口就否定我的努力', because: '這學期課業和社團同時很重' },
        replies: {
          neutral: ['讀書是你自己的事。', '我花錢讓你讀書不是讓你混的。'],
          good: ['好，你說，我聽。', '我可能口氣重了，我們坐下來談。'],
          great: ['願意說出來比悶著好，我們一起看怎麼調整。'],
          bad: ['還找藉口。', '別人都可以，就你不行？']
        }
      }
    ]
  }
];

var _scenario = {
  view: 'intro',
  active: false,
  themeId: null,
  variant: null,
  harmony: 55,
  messages: [],
  turn: 0,
  iMessage: { feel: '', when: '', because: '' }
};

function pickRandomItem(arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function openScenarioHub() {
  _scenario.view = 'intro';
  _scenario.active = false;
  _scenario.themeId = null;
  _scenario.variant = null;
  renderScenarioView();
  if (typeof showScreen === 'function') showScreen('scenario');
}

function showScenarioPicker() {
  _scenario.view = 'picker';
  renderScenarioView();
}

function renderScenarioView() {
  var root = document.getElementById('scenario-root');
  if (!root) return;
  if (_scenario.view === 'intro') root.innerHTML = renderIMessageIntro();
  else if (_scenario.view === 'picker') root.innerHTML = renderScenarioPickerPage();
  else if (_scenario.view === 'play') renderScenarioScreen();
}

function renderIMessageIntro() {
  return '<div class="scroll"><div class="pad imessage-intro" style="padding-top:20px;padding-bottom:48px">' +
    '<button type="button" class="bg mb16" onclick="showScreen(\'main\',\'l\')">← 返回主頁</button>' +
    '<h2 style="font-size:20px;font-weight:600;margin-bottom:6px">什麼是 I-message？</h2>' +
    '<p class="f13 t2 mb18" style="line-height:1.85">I-message（我訊息）是一種<strong>用「我」開頭</strong>表達感受與需要的溝通方式，能減少對方的防衛，讓對話更容易被聽見。</p>' +

    '<div class="imsg-diagram card mb16">' +
      '<p class="f12 fw5 mb12" style="color:var(--acc)">📐 基本句型結構</p>' +
      '<div class="imsg-formula">' +
        '<span class="imsg-part imsg-feel">我覺得／我感到<br><em>（感受）</em></span>' +
        '<span class="imsg-plus">+</span>' +
        '<span class="imsg-part imsg-when">當你／當…<br><em>（具體行為）</em></span>' +
        '<span class="imsg-plus">+</span>' +
        '<span class="imsg-part imsg-because">因為<br><em>（原因／需要）</em></span>' +
      '</div>' +
      '<p class="f12 t2 mt12" style="line-height:1.75">例：「<strong>我覺得</strong>有點為難，<strong>當你</strong>再次提出同樣請求，<strong>因為</strong>我這週也需要休息。」</p>' +
    '</div>' +

    '<div class="card mb16">' +
      '<p class="f13 fw5 mb10">📊 I-message vs You-message 對照</p>' +
      '<table class="imsg-table">' +
        '<thead><tr><th></th><th>You-message（你訊息）</th><th>I-message（我訊息）</th></tr></thead>' +
        '<tbody>' +
          '<tr><td class="imsg-td-label">焦點</td><td>指責對方「你怎樣」</td><td>描述自己的感受與需要</td></tr>' +
          '<tr><td class="imsg-td-label">例句</td><td class="imsg-bad">「你每次都只想到自己！」</td><td class="imsg-good">「當計畫臨時改變時，我會覺得措手不及。」</td></tr>' +
          '<tr><td class="imsg-td-label">效果</td><td>容易引發反擊或冷戰</td><td>較容易促成理解與協商</td></tr>' +
        '</tbody>' +
      '</table>' +
    '</div>' +

    '<div class="card mb16">' +
      '<p class="f13 fw5 mb10">✅ 這樣說比較好 · ❌ 盡量避免</p>' +
      '<div class="imsg-compare">' +
        '<div class="imsg-col imsg-col-good">' +
          '<p class="imsg-col-hd">建議</p>' +
          '<ul>' +
            '<li>描述<strong>具體行為</strong>，不貼標籤（「當你深夜開視訊」而非「你很自私」）</li>' +
            '<li>用「我覺得／我感到」開頭</li>' +
            '<li>說明<strong>對你的影響</strong>（睡眠、壓力、時間）</li>' +
            '<li>留白給對方回應，不一次講完所有委屈</li>' +
          '</ul>' +
        '</div>' +
        '<div class="imsg-col imsg-col-bad">' +
          '<p class="imsg-col-hd">避免</p>' +
          '<ul>' +
            '<li>「你總是／你從來／你每次都」</li>' +
            '<li>諷刺、人身攻擊、冷嘲熱諷</li>' +
            '<li>在公開場合翻舊帳</li>' +
            '<li>用「應該」命令對方（「你應該懂我」）</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="card mb20" style="background:linear-gradient(135deg,var(--sage-l) 0%,var(--card) 100%)">' +
      '<p class="f13 fw5 mb8">🎯 練習時小提醒</p>' +
      '<p class="f13 t2" style="line-height:1.85">接下來會隨機抽一個生活情境，對方角色會依你的回應反應。<strong>關係和諧度</strong>會反映你是否用了 I-message 句型——不必完美，願意練習就很好。</p>' +
    '</div>' +

    '<button type="button" class="bp mb8" onclick="showScenarioPicker()">我了解了，開始選擇情境</button>' +
    '<button type="button" class="btn-canva-secondary" onclick="startRandomScenario()">隨機抽一個情境直接練習</button>' +
  '</div></div>';
}

function renderScenarioPickerPage() {
  return '<div class="scroll"><div class="pad" style="padding-top:20px;padding-bottom:40px">' +
    '<button type="button" class="bg mb16" onclick="openScenarioHub()">← 返回說明</button>' +
    '<h2 style="font-size:20px;font-weight:600;margin-bottom:8px">選擇練習情境</h2>' +
    '<p class="f13 t2 mb10" style="line-height:1.8">每次進入會<strong>隨機抽一個具體狀況</strong>，角色與開場白都不一樣。</p>' +
    '<p class="f12 t3 mb16">共 ' + countTotalVariants() + ' 種變化情境</p>' +
    renderScenarioPicker() +
    '<button type="button" class="btn-canva-secondary mt16" onclick="startRandomScenario()">🎲 隨機抽一個情境</button>' +
  '</div></div>';
}

function countTotalVariants() {
  var n = 0;
  SCENARIO_THEMES.forEach(function (t) { n += (t.variants || []).length; });
  return n;
}

function startRandomScenario() {
  var theme = pickRandomItem(SCENARIO_THEMES);
  if (theme) startScenarioPlay(theme.id);
}

function startScenarioPlay(themeId) {
  var theme = SCENARIO_THEMES.find(function (t) { return t.id === themeId; });
  if (!theme || !theme.variants || !theme.variants.length) return;
  var variant = pickRandomItem(theme.variants);
  _scenario.view = 'play';
  _scenario.active = true;
  _scenario.themeId = themeId;
  _scenario.variant = variant;
  _scenario.harmony = 52 + Math.floor(Math.random() * 12);
  _scenario.turn = 0;
  _scenario.messages = [{ role: 'partner', text: variant.opening }];
  _scenario.iMessage = {
    feel: (variant.hints && variant.hints.feel) || '',
    when: (variant.hints && variant.hints.when) || '',
    because: (variant.hints && variant.hints.because) || ''
  };
  renderScenarioView();
  if (typeof showScreen === 'function') showScreen('scenario');
}

function restartScenarioSameTheme() {
  if (_scenario.themeId) startScenarioPlay(_scenario.themeId);
}

function exitScenarioPlay() {
  _scenario.active = false;
  _scenario.themeId = null;
  _scenario.variant = null;
  _scenario.view = 'intro';
  if (typeof showScreen === 'function') showScreen('main', 'l');
}

function getCurrentTheme() {
  return SCENARIO_THEMES.find(function (t) { return t.id === _scenario.themeId; });
}

function renderScenarioPicker() {
  return '<div class="scenario-grid">' + SCENARIO_THEMES.map(function (theme) {
    var count = (theme.variants || []).length;
    return '<button type="button" class="scenario-card" onclick="startScenarioPlay(\'' + theme.id + '\')">' +
      '<span class="scenario-icon">' + theme.icon + '</span>' +
      '<strong>' + escapeScHtml(theme.title) + '</strong>' +
      '<span class="f12 t2">' + escapeScHtml(theme.desc) + '</span>' +
      '<span class="scenario-variant-badge">' + count + ' 種隨機狀況</span></button>';
  }).join('') + '</div>';
}

function renderScenarioScreen() {
  var theme = getCurrentTheme();
  var variant = _scenario.variant;
  if (!theme || !variant) return;
  var root = document.getElementById('scenario-root');
  if (!root) return;

  var harmonyPct = Math.max(0, Math.min(100, _scenario.harmony));
  var harmonyColor = harmonyPct >= 65 ? 'var(--sage)' : harmonyPct >= 40 ? 'var(--acc)' : 'var(--red)';

  var msgs = _scenario.messages.map(function (m) {
    if (m.role === 'partner') {
      return '<div class="sc-msg sc-partner"><span class="sc-name">' + escapeScHtml(variant.partnerName) + '</span>' +
        '<div class="sc-bubble">' + escapeScHtml(m.text) + '</div></div>';
    }
    return '<div class="sc-msg sc-user"><div class="sc-bubble sc-bubble-me">' + escapeScHtml(m.text) + '</div></div>';
  }).join('');

  root.innerHTML =
    '<div class="scenario-layout">' +
    '<div class="scenario-hd">' +
      '<button type="button" class="bg" onclick="showScenarioPicker()">← 換情境</button>' +
      '<div><p class="fw6 f15">' + escapeScHtml(theme.title) + '</p>' +
      '<p class="f12 t2">' + escapeScHtml(variant.context || '') + ' · ' + escapeScHtml(variant.partnerName) + '</p></div>' +
    '</div>' +
    '<div class="harmony-meter">' +
      '<div class="harmony-label"><span>關係和諧度</span><span style="color:' + harmonyColor + '">' + harmonyPct + '%</span></div>' +
      '<div class="harmony-track"><div class="harmony-fill" style="width:' + harmonyPct + '%;background:' + harmonyColor + '"></div></div>' +
    '</div>' +
    '<div class="sc-msgs" id="sc-msgs">' + msgs + '</div>' +
    '<div class="imessage-tool">' +
      '<p class="f12 fw5 mb8">I-message 句型助手</p>' +
      '<div class="imessage-row"><label>我覺得</label><input class="inp" id="im-feel" placeholder="例：有點為難" value="' + escapeScAttr(_scenario.iMessage.feel) + '" oninput="updateIMessageField(\'feel\',this.value)"></div>' +
      '<div class="imessage-row"><label>當你</label><input class="inp" id="im-when" placeholder="例：再次提出同樣請求" value="' + escapeScAttr(_scenario.iMessage.when) + '" oninput="updateIMessageField(\'when\',this.value)"></div>' +
      '<div class="imessage-row"><label>因為</label><input class="inp" id="im-because" placeholder="例：我這週也需要休息" value="' + escapeScAttr(_scenario.iMessage.because) + '" oninput="updateIMessageField(\'because\',this.value)"></div>' +
      '<button type="button" class="btn-canva-secondary mb8" onclick="insertIMessageTemplate()">套用句型到輸入框</button>' +
    '</div>' +
    '<div class="sc-input-row">' +
      '<textarea class="inp" id="sc-inp" rows="2" placeholder="試著用 I-message 回應…" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendScenarioMsg()}"></textarea>' +
      '<button type="button" class="bp sc-send" onclick="sendScenarioMsg()">送出</button>' +
    '</div>' +
    '<div style="padding:0 14px 12px;display:flex;gap:8px">' +
      '<button type="button" class="bg flex1" style="font-size:12px;padding:8px" onclick="restartScenarioSameTheme()">🎲 同主題換狀況</button>' +
      '<button type="button" class="bg flex1" style="font-size:12px;padding:8px" onclick="showScenarioPicker()">選其他主題</button>' +
    '</div>' +
    '</div>';
  var box = document.getElementById('sc-msgs');
  if (box) box.scrollTop = box.scrollHeight;
}

function updateIMessageField(field, val) {
  _scenario.iMessage[field] = val;
}

function insertIMessageTemplate() {
  var im = _scenario.iMessage;
  var feel = im.feel || '…';
  var when = im.when || '…';
  var because = im.because || '…';
  var txt = '我覺得' + feel + '，當你' + when + '，因為' + because + '。';
  var el = document.getElementById('sc-inp');
  if (el) el.value = txt;
}

function scoreIMessage(text) {
  var t = String(text || '');
  var score = 0;
  if (/我覺得|我感到|我注意到|我聽到/.test(t)) score += 12;
  if (/當你|當這件事|當這種情況|當我/.test(t)) score += 10;
  if (/因為|原因是|所以|這讓我/.test(t)) score += 10;
  if (/你總是|你從來|你每次都|你就是/.test(t)) score -= 15;
  if (/笨蛋|廢物|去死|滾|自私|廢物/.test(t)) score -= 25;
  if (t.length < 8) score -= 5;
  if (t.length > 18) score += 5;
  return score;
}

function generatePartnerReply(userText) {
  var variant = _scenario.variant;
  if (!variant || !variant.replies) return '……';
  var delta = scoreIMessage(userText);
  _scenario.harmony = Math.max(5, Math.min(95, _scenario.harmony + delta));
  _scenario.turn++;

  var pool;
  if (delta >= 15) pool = variant.replies.great || variant.replies.good;
  else if (delta >= 5) pool = variant.replies.good;
  else if (delta <= -10) pool = variant.replies.bad;
  else pool = variant.replies.neutral;

  return pickRandomItem(pool) || '嗯…';
}

function sendScenarioMsg() {
  var el = document.getElementById('sc-inp');
  var txt = el ? el.value.trim() : '';
  if (!txt) return;
  if (!_scenario.variant) return;
  el.value = '';
  _scenario.messages.push({ role: 'user', text: txt });
  renderScenarioScreen();
  setTimeout(function () {
    var reply = generatePartnerReply(txt);
    _scenario.messages.push({ role: 'partner', text: reply });
    renderScenarioScreen();
  }, 650 + Math.random() * 550);
}

function escapeScHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeScAttr(s) {
  return escapeScHtml(s).replace(/"/g, '&quot;');
}
