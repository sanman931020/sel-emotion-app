/* SEL V2 — 情緒與事件預設資料庫 */
var SEL_DATA = {
  meta: { version: '2.0.0', locale: 'zh-TW' },
  emotionTaxonomy: {
    categories: [
      {
        id: 'high_neg_anger',
        name: '高能量負面（憤怒與攻擊性）',
        valence: 'negative', arousal: 'high',
        colors: {
          primary: '#D4A5A5', glow: 'rgba(212,165,165,0.32)', glowSoft: 'rgba(212,165,165,0.1)',
          chip: '#B88888', chipBg: '#FAF0F0', canvas: '#C9A0A0'
        },
        glowProfile: { intensity: 0.45, pulseSpeed: 'medium', spread: 1.0 }
      },
      {
        id: 'high_neg_anxiety',
        name: '高能量負面（焦慮與恐懼）',
        valence: 'negative', arousal: 'high',
        colors: {
          primary: '#E8D9B5', glow: 'rgba(232,217,181,0.3)', glowSoft: 'rgba(232,217,181,0.1)',
          chip: '#C4B08A', chipBg: '#FFFBF0', canvas: '#D9C9A8'
        },
        glowProfile: { intensity: 0.42, pulseSpeed: 'medium', spread: 0.95 }
      },
      {
        id: 'low_neg_sadness',
        name: '低能量負面（悲傷與耗竭）',
        valence: 'negative', arousal: 'low',
        colors: {
          primary: '#A8BDD4', glow: 'rgba(168,189,212,0.32)', glowSoft: 'rgba(168,189,212,0.1)',
          chip: '#8FA8C4', chipBg: '#F0F4FA', canvas: '#9BB5D0'
        },
        glowProfile: { intensity: 0.38, pulseSpeed: 'slow', spread: 0.9 }
      },
      {
        id: 'complex_self',
        name: '自我評價與複雜情緒',
        valence: 'mixed', arousal: 'medium',
        colors: {
          primary: '#C4A8D4', glow: 'rgba(196,168,212,0.3)', glowSoft: 'rgba(196,168,212,0.1)',
          chip: '#A890C4', chipBg: '#F5F0FA', canvas: '#B8A0CC'
        },
        glowProfile: { intensity: 0.4, pulseSpeed: 'slow', spread: 0.95 }
      },
      {
        id: 'buffer_positive',
        name: '微弱正向 / 緩衝情緒',
        valence: 'positive', arousal: 'low',
        colors: {
          primary: '#A8C9B0', glow: 'rgba(168,201,176,0.28)', glowSoft: 'rgba(168,201,176,0.1)',
          chip: '#8BB89A', chipBg: '#EFF7F2', canvas: '#9DC4A8'
        },
        glowProfile: { intensity: 0.32, pulseSpeed: 'slow', spread: 0.85 }
      },
      {
        id: 'positive_emotions',
        name: '正向情緒',
        valence: 'positive', arousal: 'medium',
        colors: {
          primary: '#E8C9A0', glow: 'rgba(232,201,160,0.3)', glowSoft: 'rgba(232,201,160,0.1)',
          chip: '#D4B088', chipBg: '#FFF8EE', canvas: '#E0C4A0'
        },
        glowProfile: { intensity: 0.35, pulseSpeed: 'slow', spread: 1.0 }
      }
    ],
    tags: [
      { id: 'emo_anger', categoryId: 'high_neg_anger', label: '憤怒' },
      { id: 'emo_irritable', categoryId: 'high_neg_anger', label: '暴躁' },
      { id: 'emo_annoyed', categoryId: 'high_neg_anger', label: '煩悶/不爽' },
      { id: 'emo_unfair', categoryId: 'high_neg_anger', label: '不甘心' },
      { id: 'emo_resentment', categoryId: 'high_neg_anger', label: '怨恨' },
      { id: 'emo_jealous', categoryId: 'high_neg_anger', label: '嫉妒' },
      { id: 'emo_betrayed', categoryId: 'high_neg_anger', label: '被背叛的' },
      { id: 'emo_hostile', categoryId: 'high_neg_anger', label: '充滿敵意' },
      { id: 'emo_wronged', categoryId: 'high_neg_anger', label: '委屈不平' },
      { id: 'emo_furious', categoryId: 'high_neg_anger', label: '氣急敗壞' },
      { id: 'emo_anxiety', categoryId: 'high_neg_anxiety', label: '焦慮' },
      { id: 'emo_panic', categoryId: 'high_neg_anxiety', label: '恐慌' },
      { id: 'emo_afraid', categoryId: 'high_neg_anxiety', label: '害怕' },
      { id: 'emo_overwhelmed', categoryId: 'high_neg_anxiety', label: '壓力山大' },
      { id: 'emo_tense', categoryId: 'high_neg_anxiety', label: '緊繃' },
      { id: 'emo_breakdown', categoryId: 'high_neg_anxiety', label: '崩潰' },
      { id: 'emo_insecure', categoryId: 'high_neg_anxiety', label: '不安/沒安全感' },
      { id: 'emo_worried', categoryId: 'high_neg_anxiety', label: '擔憂' },
      { id: 'emo_suffocating', categoryId: 'high_neg_anxiety', label: '窒息感' },
      { id: 'emo_petrified', categoryId: 'high_neg_anxiety', label: '驚惶失措' },
      { id: 'emo_restless', categoryId: 'high_neg_anxiety', label: '煩躁不安' },
      { id: 'emo_paranoid', categoryId: 'high_neg_anxiety', label: '疑神疑鬼' },
      { id: 'emo_sad', categoryId: 'low_neg_sadness', label: '悲傷' },
      { id: 'emo_helpless', categoryId: 'low_neg_sadness', label: '無助' },
      { id: 'emo_hopeless', categoryId: 'low_neg_sadness', label: '絕望' },
      { id: 'emo_lonely', categoryId: 'low_neg_sadness', label: '孤獨/寂寞' },
      { id: 'emo_exhausted', categoryId: 'low_neg_sadness', label: '疲憊/心累' },
      { id: 'emo_frustrated', categoryId: 'low_neg_sadness', label: '沮喪' },
      { id: 'emo_empty', categoryId: 'low_neg_sadness', label: '空虛' },
      { id: 'emo_apathetic', categoryId: 'low_neg_sadness', label: '提不起勁' },
      { id: 'emo_numb', categoryId: 'low_neg_sadness', label: '麻木' },
      { id: 'emo_disappointed', categoryId: 'low_neg_sadness', label: '失望' },
      { id: 'emo_abandoned', categoryId: 'low_neg_sadness', label: '被遺棄的' },
      { id: 'emo_setback', categoryId: 'low_neg_sadness', label: '挫折感' },
      { id: 'emo_depressed', categoryId: 'low_neg_sadness', label: '憂鬱' },
      { id: 'emo_drained', categoryId: 'low_neg_sadness', label: '提心吊膽後的虛脫' },
      { id: 'emo_self_doubt', categoryId: 'complex_self', label: '自我懷疑' },
      { id: 'emo_self_hate', categoryId: 'complex_self', label: '覺得自己很糟' },
      { id: 'emo_low_confidence', categoryId: 'complex_self', label: '沒自信/自卑' },
      { id: 'emo_ashamed_public', categoryId: 'complex_self', label: '丟臉/難堪' },
      { id: 'emo_shame', categoryId: 'complex_self', label: '羞愧' },
      { id: 'emo_guilt', categoryId: 'complex_self', label: '罪惡感' },
      { id: 'emo_regret', categoryId: 'complex_self', label: '後悔' },
      { id: 'emo_conflicted', categoryId: 'complex_self', label: '矛盾/糾結' },
      { id: 'emo_impostor', categoryId: 'complex_self', label: '冒牌者症候群的感覺' },
      { id: 'emo_misunderstood', categoryId: 'complex_self', label: '不被理解的' },
      { id: 'emo_burden', categoryId: 'complex_self', label: '覺得自己是個負擔' },
      { id: 'emo_brave_face', categoryId: 'buffer_positive', label: '逞強的' },
      { id: 'emo_need_hug', categoryId: 'buffer_positive', label: '渴望被抱抱' },
      { id: 'emo_need_quiet', categoryId: 'buffer_positive', label: '想要安靜一下' },
      { id: 'emo_happy', categoryId: 'positive_emotions', label: '開心' },
      { id: 'emo_pleasant', categoryId: 'positive_emotions', label: '愉快' },
      { id: 'emo_joyful', categoryId: 'positive_emotions', label: '快樂' },
      { id: 'emo_hopeful', categoryId: 'positive_emotions', label: '有希望' },
      { id: 'emo_energetic', categoryId: 'positive_emotions', label: '充滿活力' },
      { id: 'emo_delighted', categoryId: 'positive_emotions', label: '喜悅' },
      { id: 'emo_content', categoryId: 'positive_emotions', label: '滿足' },
      { id: 'emo_grateful', categoryId: 'positive_emotions', label: '感恩' },
      { id: 'emo_calm', categoryId: 'positive_emotions', label: '平靜' },
      { id: 'emo_confident', categoryId: 'positive_emotions', label: '自信' },
      { id: 'emo_inspired', categoryId: 'positive_emotions', label: '振奮' },
      { id: 'emo_anticipating', categoryId: 'positive_emotions', label: '期待' },
      { id: 'emo_excited', categoryId: 'positive_emotions', label: '興奮' },
      { id: 'emo_relaxed', categoryId: 'positive_emotions', label: '輕鬆' },
      { id: 'emo_blissful', categoryId: 'positive_emotions', label: '幸福' },
      { id: 'emo_proud', categoryId: 'positive_emotions', label: '自豪' },
      { id: 'emo_warm_feel', categoryId: 'positive_emotions', label: '溫暖' },
      { id: 'emo_grounded', categoryId: 'positive_emotions', label: '踏實' },
      { id: 'emo_surprised_pos', categoryId: 'positive_emotions', label: '驚喜' },
      { id: 'emo_touched', categoryId: 'positive_emotions', label: '感動' }
    ]
  },
  eventTaxonomy: {
    categories: [
      { id: 'evt_academic', name: '學業與課業', icon: '📚' },
      { id: 'evt_social', name: '人際與社交', icon: '🤝' },
      { id: 'evt_career', name: '職涯與未來', icon: '🧭' },
      { id: 'evt_romance', name: '感情與親密關係', icon: '💞' },
      { id: 'evt_family', name: '家庭與經濟', icon: '🏠' },
      { id: 'evt_daily', name: '日常生活', icon: '🌿' }
    ],
    tags: [
      { id: 'evt_exam_stress', categoryId: 'evt_academic', label: '期中/期末考' },
      { id: 'evt_report_block', categoryId: 'evt_academic', label: '學期報告' },
      { id: 'evt_bad_teammate', categoryId: 'evt_academic', label: '分組報告' },
      { id: 'evt_presentation', categoryId: 'evt_academic', label: '上台報告' },
      { id: 'evt_grade_fail', categoryId: 'evt_academic', label: '成績公布' },
      { id: 'evt_failed_course', categoryId: 'evt_academic', label: '必修不及格' },
      { id: 'evt_strict_prof', categoryId: 'evt_academic', label: '與教授互動' },
      { id: 'evt_credit_short', categoryId: 'evt_academic', label: '選課/學分' },
      { id: 'evt_project_fail', categoryId: 'evt_academic', label: '專題/實驗' },
      { id: 'evt_missed_deadline', categoryId: 'evt_academic', label: '作業截止日' },
      { id: 'evt_behind_study', categoryId: 'evt_academic', label: '課業進度' },
      { id: 'evt_excluded', categoryId: 'evt_social', label: '人際疏離' },
      { id: 'evt_not_fitting', categoryId: 'evt_social', label: '社交圈' },
      { id: 'evt_roommate', categoryId: 'evt_social', label: '室友相處' },
      { id: 'evt_friend_betrayal', categoryId: 'evt_social', label: '朋友關係' },
      { id: 'evt_pretending', categoryId: 'evt_social', label: '群體活動' },
      { id: 'evt_fomo', categoryId: 'evt_social', label: '社群媒體' },
      { id: 'evt_no_confidant', categoryId: 'evt_social', label: '親密友誼' },
      { id: 'evt_social_fatigue', categoryId: 'evt_social', label: '社交邀約' },
      { id: 'evt_event_stress', categoryId: 'evt_social', label: '籌辦活動' },
      { id: 'evt_bullying', categoryId: 'evt_social', label: '霸凌事件' },
      { id: 'evt_lost_direction', categoryId: 'evt_career', label: '生涯規劃' },
      { id: 'evt_rejection', categoryId: 'evt_career', label: '求職面試' },
      { id: 'evt_peer_pressure', categoryId: 'evt_career', label: '同儕比較' },
      { id: 'evt_grad_exam', categoryId: 'evt_career', label: '考研' },
      { id: 'evt_no_passion', categoryId: 'evt_career', label: '興趣探索' },
      { id: 'evt_job_anxiety', categoryId: 'evt_career', label: '畢業求職' },
      { id: 'evt_empty_resume', categoryId: 'evt_career', label: '履歷準備' },
      { id: 'evt_parent_expect', categoryId: 'evt_career', label: '家人期望' },
      { id: 'evt_license_exam', categoryId: 'evt_career', label: '國考/證照' },
      { id: 'evt_breakup', categoryId: 'evt_romance', label: '分手' },
      { id: 'evt_unrequited', categoryId: 'evt_romance', label: '曖昧關係' },
      { id: 'evt_partner_fight', categoryId: 'evt_romance', label: '伴侶爭執' },
      { id: 'evt_ldr', categoryId: 'evt_romance', label: '遠距離戀愛' },
      { id: 'evt_cheated', categoryId: 'evt_romance', label: '感情信任' },
      { id: 'evt_love_study', categoryId: 'evt_romance', label: '戀愛與學業' },
      { id: 'evt_love_insecure', categoryId: 'evt_romance', label: '戀愛經驗' },
      { id: 'evt_ex_shadow', categoryId: 'evt_romance', label: '前任' },
      { id: 'evt_lose_self', categoryId: 'evt_romance', label: '親密關係界線' },
      { id: 'evt_parent_control', categoryId: 'evt_family', label: '家人管教' },
      { id: 'evt_low_budget', categoryId: 'evt_family', label: '生活費' },
      { id: 'evt_work_overload', categoryId: 'evt_family', label: '打工' },
      { id: 'evt_homesick', categoryId: 'evt_family', label: '離家生活' },
      { id: 'evt_family_crisis', categoryId: 'evt_family', label: '家庭經濟' },
      { id: 'evt_family_illness', categoryId: 'evt_family', label: '家人健康' },
      { id: 'evt_sleep_disorder', categoryId: 'evt_daily', label: '睡眠作息' },
      { id: 'evt_illness_injury', categoryId: 'evt_daily', label: '生病/受傷' },
      { id: 'evt_body_image', categoryId: 'evt_daily', label: '外貌/身體' },
      { id: 'evt_housing', categoryId: 'evt_daily', label: '租屋' },
      { id: 'evt_too_many_chores', categoryId: 'evt_daily', label: '日常瑣事' }
    ]
  }
};
