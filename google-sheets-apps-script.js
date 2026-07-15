/**
 * 心靈夥伴 — Google 試算表後端（貼到 Apps Script）
 *
 * 設定步驟：
 * 1. 新建 Google 試算表，第一分頁命名為「使用紀錄」
 * 2. 擴充功能 → Apps Script，貼上本檔全部內容並儲存
 * 3. 部署 → 新增部署 → 類型選「網頁應用程式」
 *    - 執行身分：我
 *    - 具有存取權的使用者：任何人
 * 4. 部署後複製「網頁應用程式網址」
 * 5. 專案執行 setup-google-sheets.ps1，貼上該網址
 * 6. 重啟 npm run dev
 */

var SHEET_NAME = '使用紀錄';

var HEADERS = [
  '時間戳記',
  '使用者綽號',
  '身分',
  '學校類型',
  '區域',
  '學校',
  'email',
  '使用前情緒壓力指數',
  '使用後情緒壓力指數',
  '使用前後差(前-後)',
  '系統滿意度',
  '回饋',
  '暖心支持對象_關係',
  '帳號',
  '有分享摘要',
  '情緒標籤',
  '事件標籤',
  '主題',
  '場次ID',
  '略過評分',
];

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  } else {
    // 若表頭不完整則補齊（不覆寫既有資料）
    var first = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    var empty = !first || !first[0];
    if (empty) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: 'sel-analytics', sheet: SHEET_NAME }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var row = (body && body.row) || body || {};
    var sheet = getOrCreateSheet_();
    sheet.appendRow([
      row.timestamp || new Date().toISOString(),
      row.nickname || '',
      row.role || '',
      row.schoolType || '',
      row.region || '',
      row.school || '',
      row.email || '',
      row.preScore === 0 || row.preScore ? row.preScore : '',
      row.postScore === 0 || row.postScore ? row.postScore : '',
      row.scoreDiff === 0 || row.scoreDiff ? row.scoreDiff : '',
      row.satisfaction === 0 || row.satisfaction ? row.satisfaction : '',
      row.feedback || '',
      row.supportRelations || '',
      row.account || '',
      row.shared || '',
      row.emotionLabels || '',
      row.eventLabels || '',
      row.topic || '',
      row.sessionId || '',
      row.skippedRating || '',
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
