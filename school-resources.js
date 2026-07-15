/* SEL V2 — 全國公用心理支持資源（不含校園校安／諮商資料） */
var NATIONAL_RESOURCES = [
  {
    id: 'res_1925',
    emoji: '📞',
    title: '1925 安心專線',
    sub: '24 小時免費 · 衛福部心理諮詢服務',
    tel: '1925',
    url: 'https://www.mohw.gov.tw/cp-2626-19209-1.html',
    urlLabel: '衛福部官網'
  },
  {
    id: 'res_lifeline',
    emoji: '🆘',
    title: '生命線協談專線',
    sub: '1995 · 24 小時',
    tel: '1995',
    url: 'https://www.life1995.org.tw/',
    urlLabel: '前往官網'
  },
  {
    id: 'res_teacher_chang',
    emoji: '💬',
    title: '張老師服務',
    sub: '1980 · 週一至週六',
    tel: '1980',
    url: 'https://www.1980.org.tw/',
    urlLabel: '前往官網'
  },
  {
    id: 'res_mohw_mental',
    emoji: '💻',
    title: '心理健康網（心快活）',
    sub: '衛福部心理健康學習平台',
    url: 'https://wellbeing.mohw.gov.tw/',
    urlLabel: '衛福部官網'
  }
];

/* 校園專屬輔導資源（依 schoolId 對應 university-list.js） */
var CAMPUS_RESOURCES = {
  sch_utaipei: {
    id: 'sch_utaipei',
    name: '臺北市立大學',
    center: '學生輔導中心',
    introPreview: '諮商採預約制。您可透過學生校務系統線上預約、撥打專線，或親自至辦公室填寫申請單完成手續。中心也提供遠距心理服務，供無法到校的同學彈性選擇。',
    intro: '諮商採預約制。您可透過學生校務系統線上預約、撥打專線，或親自至辦公室填寫申請單完成手續。中心也提供遠距心理服務，供無法到校的同學彈性選擇。',
    url: 'https://advisory.utaipei.edu.tw/',
    urlLabel: '前往輔導中心官網／預約',
    campuses: [
      {
        emoji: '📍',
        name: '博愛校區（總區）',
        address: '勤樸樓 C304 室（臺北市中正區愛國西路一號）',
        tel: '02-2311-3040',
        telNote: '分機 4331～4335',
        hours: '每週一至週五 08:30–12:00，13:30–17:00'
      },
      {
        emoji: '📍',
        name: '天母校區',
        address: '行政大樓 2 樓 C224 室（學務處旁，臺北市士林區忠誠路二段101號）',
        tel: '02-2871-8288',
        telNote: '轉 7931～7937',
        hours: '每週一至週五 08:30–12:00，13:30–17:00'
      }
    ],
    notesTitle: '預約與晤談注意事項',
    notes: [
      '填寫申請單：親自或透過系統預約後，需親洽中心填寫「個別諮商預約單」或申請表；每學期初次來談者會安排初談評估。',
      '服務免費：心輔中心各項諮商服務皆免費提供，請珍惜資源。',
      '專屬時間：確認排定後，每次晤談將為您保留專屬的 50 分鐘。',
      '遠距服務：如需申請遠距心理服務，請至官網填寫遠距心理服務預約表單。'
    ]
  },
  sch_cute: {
    id: 'sch_cute',
    name: '中國科技大學',
    center: '學生輔導中心',
    intro: '學輔中心提供線上與實體預約管道。學生可透過中國科大單一入口網的諮商關懷系統填寫申請，或直接致電、親臨各校區辦公室進行預約。',
    url: 'https://sites.google.com/gm.cute.edu.tw/student-counseling-center/',
    urlLabel: '前往學輔中心官網',
    campuses: [
      {
        emoji: '📍',
        name: '臺北校區',
        address: '崇德樓 201 室',
        tel: '02-2931-3416',
        telNote: '或 02-2935-6107；轉 2151、2159、2973'
      },
      {
        emoji: '📍',
        name: '新竹校區',
        tel: '03-699-1111',
        telNote: '轉 1271、1272、1273'
      }
    ],
    notesTitle: '預約流程與方式',
    notes: [
      '網路預約：登入中國科技大學單一入口網站 ➔ 學生資訊系統 ➔ 諮商關懷系統 ➔ 申請諮商，填寫基本資料、期許與可諮商時間，送出後等待心理師聯繫。',
      '電話／親自預約：於上班時間直接致電或前往學輔中心辦公室，由老師協助安排。'
    ]
  }
};

function getCampusResourceByProfile(profile){
  var schoolId=profile&&profile.schoolId;
  var schoolName=profile&&profile.school;
  if(schoolId&&CAMPUS_RESOURCES[schoolId]) return CAMPUS_RESOURCES[schoolId];
  if(schoolName){
    for(var id in CAMPUS_RESOURCES){
      if(CAMPUS_RESOURCES[id].name===schoolName) return CAMPUS_RESOURCES[id];
    }
  }
  return null;
}
