/* SEL V2 — 情緒與事件預設資料庫（含情緒心理學色票） */
var SEL_DATA = {
  meta: { version: '2.1.1', locale: 'zh-TW' },
  emotionTaxonomy: {
    categories: [
      {
        id: 'high_neg_anger',
        name: '高能量負面（憤怒與攻擊性）',
        moodCat: 'anger',
        valence: 'negative', arousal: 'high',
        colors: {
          primary: '#E53935', glow: 'rgba(229,57,53,0.28)', glowSoft: 'rgba(229,57,53,0.1)',
          chip: '#C62828', chipBg: '#FFF5F3', canvas: '#E53935', bg: '#FFF5F3'
        },
        glowProfile: { intensity: 0.48, pulseSpeed: 'medium', spread: 1.0 }
      },
      {
        id: 'high_neg_anxiety',
        name: '高能量負面（焦慮與恐懼）',
        moodCat: 'anxiety',
        valence: 'negative', arousal: 'high',
        colors: {
          primary: '#FF7043', glow: 'rgba(255,112,67,0.28)', glowSoft: 'rgba(255,112,67,0.1)',
          chip: '#E65100', chipBg: '#FFF8F3', canvas: '#FF8A65', bg: '#FFF8F3'
        },
        glowProfile: { intensity: 0.46, pulseSpeed: 'medium', spread: 0.95 }
      },
      {
        id: 'low_neg_sadness',
        name: '低能量負面（悲傷與耗竭）',
        moodCat: 'sad',
        valence: 'negative', arousal: 'low',
        colors: {
          primary: '#3A6EA5', glow: 'rgba(58,110,165,0.28)', glowSoft: 'rgba(58,110,165,0.1)',
          chip: '#2F5D8C', chipBg: '#F3F6FA', canvas: '#5B7C99', bg: '#F3F6FA'
        },
        glowProfile: { intensity: 0.36, pulseSpeed: 'slow', spread: 0.9 }
      },
      {
        id: 'complex_self',
        name: '自我評價與複雜情緒',
        moodCat: 'self',
        valence: 'mixed', arousal: 'medium',
        colors: {
          primary: '#7E57C2', glow: 'rgba(126,87,194,0.28)', glowSoft: 'rgba(126,87,194,0.1)',
          chip: '#5E35B1', chipBg: '#F8F5FC', canvas: '#9575CD', bg: '#F8F5FC'
        },
        glowProfile: { intensity: 0.4, pulseSpeed: 'slow', spread: 0.95 }
      },
      {
        id: 'buffer_positive',
        name: '微弱正向 / 緩衝情緒',
        moodCat: 'buffer',
        valence: 'positive', arousal: 'low',
        colors: {
          primary: '#F8BBD0', glow: 'rgba(248,187,208,0.26)', glowSoft: 'rgba(178,223,219,0.12)',
          chip: '#A1887F', chipBg: '#F7FAF9', canvas: '#B2DFDB', bg: '#F7FAF9'
        },
        glowProfile: { intensity: 0.3, pulseSpeed: 'slow', spread: 0.85 }
      },
      {
        id: 'positive_emotions',
        name: '正向情緒',
        moodCat: 'positive',
        valence: 'positive', arousal: 'medium',
        colors: {
          primary: '#FFD54F', glow: 'rgba(255,213,79,0.3)', glowSoft: 'rgba(255,213,79,0.1)',
          chip: '#FFA000', chipBg: '#FFFBF2', canvas: '#FFCA28', bg: '#FFFBF2'
        },
        glowProfile: { intensity: 0.35, pulseSpeed: 'slow', spread: 1.0 }
      }
    ],
    tags: [
      /* anger — 紅／朱：怒火、攻擊性（色彩心理學：紅色＝喚醒與怒意） */
      { id: 'emo_anger', categoryId: 'high_neg_anger', moodCat: 'anger', label: '憤怒', color: '#E53935' },
      { id: 'emo_irritable', categoryId: 'high_neg_anger', moodCat: 'anger', label: '暴躁', color: '#D32F2F' },
      { id: 'emo_annoyed', categoryId: 'high_neg_anger', moodCat: 'anger', label: '煩悶/不爽', color: '#F4511E' },
      { id: 'emo_unfair', categoryId: 'high_neg_anger', moodCat: 'anger', label: '不甘心', color: '#E64A19' },
      { id: 'emo_resentment', categoryId: 'high_neg_anger', moodCat: 'anger', label: '怨恨', color: '#8B1A1A' },
      { id: 'emo_jealous', categoryId: 'high_neg_anger', moodCat: 'anger', label: '嫉妒', color: '#9C1B4A' },
      { id: 'emo_betrayed', categoryId: 'high_neg_anger', moodCat: 'anger', label: '被背叛的', color: '#B71C1C' },
      { id: 'emo_hostile', categoryId: 'high_neg_anger', moodCat: 'anger', label: '充滿敵意', color: '#C62828' },
      { id: 'emo_wronged', categoryId: 'high_neg_anger', moodCat: 'anger', label: '委屈不平', color: '#FF5252' },
      { id: 'emo_furious', categoryId: 'high_neg_anger', moodCat: 'anger', label: '氣急敗壞', color: '#FF1744' },
      /* anxiety — 橙＝焦慮緊繃；紫＝恐懼未知（每色唯一，供心靈畫布） */
      { id: 'emo_anxiety', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '焦慮', color: '#FF7043' },
      { id: 'emo_panic', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '恐慌', color: '#FF5722' },
      { id: 'emo_afraid', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '害怕', color: '#6A1B9A' },
      { id: 'emo_overwhelmed', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '壓力山大', color: '#FF6E40' },
      { id: 'emo_tense', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '緊繃', color: '#FFAB40' },
      { id: 'emo_breakdown', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '崩潰', color: '#E65100' },
      { id: 'emo_insecure', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '不安/沒安全感', color: '#FF8A65' },
      { id: 'emo_worried', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '擔憂', color: '#FFA726' },
      { id: 'emo_suffocating', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '窒息感', color: '#4A148C' },
      { id: 'emo_petrified', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '驚惶失措', color: '#7B1FA2' },
      { id: 'emo_restless', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '煩躁不安', color: '#FF9E80' },
      { id: 'emo_paranoid', categoryId: 'high_neg_anxiety', moodCat: 'anxiety', label: '疑神疑鬼', color: '#5E35B1' },
      /* sad — 藍／灰藍：低能量、退縮、悲傷 */
      { id: 'emo_sad', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '悲傷', color: '#3A6EA5' },
      { id: 'emo_helpless', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '無助', color: '#5B7C99' },
      { id: 'emo_hopeless', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '絕望', color: '#1E3A5F' },
      { id: 'emo_lonely', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '孤獨/寂寞', color: '#4A6FA5' },
      { id: 'emo_exhausted', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '疲憊/心累', color: '#90A4AE' },
      { id: 'emo_frustrated', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '沮喪', color: '#5C6BC0' },
      { id: 'emo_empty', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '空虛', color: '#B0BEC5' },
      { id: 'emo_apathetic', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '提不起勁', color: '#78909C' },
      { id: 'emo_numb', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '麻木', color: '#9E9E9E' },
      { id: 'emo_disappointed', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '失望', color: '#547EA8' },
      { id: 'emo_abandoned', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '被遺棄的', color: '#2F5D8C' },
      { id: 'emo_setback', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '挫折感', color: '#607D8B' },
      { id: 'emo_depressed', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '憂鬱', color: '#37474F' },
      { id: 'emo_drained', categoryId: 'low_neg_sadness', moodCat: 'sad', label: '提心吊膽後的虛脫', color: '#8FA3AD' },
      /* self — 紫／靛：內省、羞恥、複雜自我評價 */
      { id: 'emo_self_doubt', categoryId: 'complex_self', moodCat: 'self', label: '自我懷疑', color: '#7E57C2' },
      { id: 'emo_self_hate', categoryId: 'complex_self', moodCat: 'self', label: '覺得自己很糟', color: '#512DA8' },
      { id: 'emo_low_confidence', categoryId: 'complex_self', moodCat: 'self', label: '沒自信/自卑', color: '#616161' },
      { id: 'emo_ashamed_public', categoryId: 'complex_self', moodCat: 'self', label: '丟臉/難堪', color: '#BA68C8' },
      { id: 'emo_shame', categoryId: 'complex_self', moodCat: 'self', label: '羞愧', color: '#8E24AA' },
      { id: 'emo_guilt', categoryId: 'complex_self', moodCat: 'self', label: '罪惡感', color: '#311B92' },
      { id: 'emo_regret', categoryId: 'complex_self', moodCat: 'self', label: '後悔', color: '#AB47BC' },
      { id: 'emo_conflicted', categoryId: 'complex_self', moodCat: 'self', label: '矛盾/糾結', color: '#9575CD' },
      { id: 'emo_impostor', categoryId: 'complex_self', moodCat: 'self', label: '冒牌者症候群的感覺', color: '#B39DDB' },
      { id: 'emo_misunderstood', categoryId: 'complex_self', moodCat: 'self', label: '不被理解的', color: '#4527A0' },
      { id: 'emo_burden', categoryId: 'complex_self', moodCat: 'self', label: '覺得自己是個負擔', color: '#708090' },
      /* buffer — 柔粉／茶褐／青綠：過渡與自我安撫 */
      { id: 'emo_brave_face', categoryId: 'buffer_positive', moodCat: 'buffer', label: '逞強的', color: '#A1887F' },
      { id: 'emo_need_hug', categoryId: 'buffer_positive', moodCat: 'buffer', label: '渴望被抱抱', color: '#F8BBD0' },
      { id: 'emo_need_quiet', categoryId: 'buffer_positive', moodCat: 'buffer', label: '想要安靜一下', color: '#80CBC4' },
      /* positive — 黃＝喜悅；綠＝踏實；金／珊瑚＝溫暖感恩（皆唯一） */
      { id: 'emo_happy', categoryId: 'positive_emotions', moodCat: 'positive', label: '開心', color: '#FFD54F' },
      { id: 'emo_pleasant', categoryId: 'positive_emotions', moodCat: 'positive', label: '愉快', color: '#FFE082' },
      { id: 'emo_joyful', categoryId: 'positive_emotions', moodCat: 'positive', label: '快樂', color: '#FFCA28' },
      { id: 'emo_hopeful', categoryId: 'positive_emotions', moodCat: 'positive', label: '有希望', color: '#F4C430' },
      { id: 'emo_energetic', categoryId: 'positive_emotions', moodCat: 'positive', label: '充滿活力', color: '#FFB300' },
      { id: 'emo_delighted', categoryId: 'positive_emotions', moodCat: 'positive', label: '喜悅', color: '#FFC107' },
      { id: 'emo_content', categoryId: 'positive_emotions', moodCat: 'positive', label: '滿足', color: '#FFEE58' },
      { id: 'emo_grateful', categoryId: 'positive_emotions', moodCat: 'positive', label: '感恩', color: '#FFB74D' },
      { id: 'emo_calm', categoryId: 'positive_emotions', moodCat: 'positive', label: '平靜', color: '#B2DFDB' },
      { id: 'emo_confident', categoryId: 'positive_emotions', moodCat: 'positive', label: '自信', color: '#FFA000' },
      { id: 'emo_inspired', categoryId: 'positive_emotions', moodCat: 'positive', label: '振奮', color: '#FF8F00' },
      { id: 'emo_anticipating', categoryId: 'positive_emotions', moodCat: 'positive', label: '期待', color: '#FFCC80' },
      { id: 'emo_excited', categoryId: 'positive_emotions', moodCat: 'positive', label: '興奮', color: '#FF9800' },
      { id: 'emo_relaxed', categoryId: 'positive_emotions', moodCat: 'positive', label: '輕鬆', color: '#FFF59D' },
      { id: 'emo_blissful', categoryId: 'positive_emotions', moodCat: 'positive', label: '幸福', color: '#FF8FAB' },
      { id: 'emo_proud', categoryId: 'positive_emotions', moodCat: 'positive', label: '自豪', color: '#DAA520' },
      { id: 'emo_warm_feel', categoryId: 'positive_emotions', moodCat: 'positive', label: '溫暖', color: '#FFAB91' },
      { id: 'emo_grounded', categoryId: 'positive_emotions', moodCat: 'positive', label: '踏實', color: '#66BB6A' },
      { id: 'emo_surprised_pos', categoryId: 'positive_emotions', moodCat: 'positive', label: '驚喜', color: '#FFD740' },
      { id: 'emo_touched', categoryId: 'positive_emotions', moodCat: 'positive', label: '感動', color: '#F48FB1' }
    ]
  },
  eventTaxonomy: {
    categories: [
      { id: 'evt_academic', name: '學業與課業', icon: '📚' },
      { id: 'evt_social', name: '人際與社交', icon: '🤝' },
      { id: 'evt_career', name: '職涯與未來', icon: '🧭' },
      { id: 'evt_internship', name: '實習與職場', icon: '💼' },
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
      /* 實習與職場 */
      { id: 'evt_intern_apply', categoryId: 'evt_internship', label: '實習申請/面試' },
      { id: 'evt_intern_first_day', categoryId: 'evt_internship', label: '第一天上工' },
      { id: 'evt_intern_supervisor', categoryId: 'evt_internship', label: '與主管互動' },
      { id: 'evt_intern_feedback', categoryId: 'evt_internship', label: '主管回饋/考核' },
      { id: 'evt_intern_workload', categoryId: 'evt_internship', label: '實習工作量' },
      { id: 'evt_intern_colleague', categoryId: 'evt_internship', label: '職場人際' },
      { id: 'evt_intern_mistake', categoryId: 'evt_internship', label: '工作失誤' },
      { id: 'evt_intern_unpaid', categoryId: 'evt_internship', label: '無薪/勞動條件' },
      { id: 'evt_intern_study_balance', categoryId: 'evt_internship', label: '實習與課業兩頭燒' },
      { id: 'evt_intern_commute', categoryId: 'evt_internship', label: '通勤/遠距實習' },
      { id: 'evt_intern_unsure', categoryId: 'evt_internship', label: '懷疑適不適合這行' },
      { id: 'evt_intern_ending', categoryId: 'evt_internship', label: '實習結束/離職' },
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
