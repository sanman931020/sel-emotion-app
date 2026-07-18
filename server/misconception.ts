/**
 * 傷害合理化導正 + 情緒價値一致性 — 諮商回覆 JSON 解析
 */

export type RiskLevel = 'Level 0' | 'Level 1' | 'Level 2' | 'Level 3';
export type MisconceptionType =
  | 'none'
  | 'harm_as_affection'
  | 'bullying_as_friendship'
  | 'other';
export type SystemAction = 'none' | 'flag_for_daily_report' | 'trigger_immediate_alert';
export type EmotionValence = 'positive' | 'negative' | 'mixed' | 'unclear';
export type EmotionConsistency = 'aligned' | 'conflict' | 'insufficient';

export interface CounselorTurnResult {
  reply: string;
  risk_level: RiskLevel;
  has_misconception: boolean;
  misconception_type: MisconceptionType;
  reasoning: string;
  misconception_alert: string;
  system_action: SystemAction;
  valence: EmotionValence;
  consistency: EmotionConsistency;
  forbidden_assumption_avoided: boolean;
  show_medical_disclaimer: boolean;
  medical_disclaimer: {
    title: string;
    body: string;
    confirm_label: string;
  };
  show_safety_notice: boolean;
  safety_notice: {
    title: string;
    body: string;
    confirm_label: string;
    resources: Array<{ name: string; detail: string }>;
  };
  categories_detected: string[];
}

export const COUNSELOR_JSON_FALLBACK: CounselorTurnResult = {
  reply: '',
  risk_level: 'Level 0',
  has_misconception: false,
  misconception_type: 'none',
  reasoning: '',
  misconception_alert: '',
  system_action: 'none',
  valence: 'unclear',
  consistency: 'insufficient',
  forbidden_assumption_avoided: true,
  show_medical_disclaimer: false,
  medical_disclaimer: { title: '', body: '', confirm_label: '我知道了' },
  show_safety_notice: false,
  safety_notice: { title: '', body: '', confirm_label: '我知道了', resources: [] },
  categories_detected: [],
};

/** 情緒價値一致性 — 最高優先，防止「事件名稱像壞事就預設痛苦」 */
export const VALENCE_CONSISTENCY_ADDENDUM = `
【最高優先：情緒價値一致性】
你是溫暖、同理的心靈夥伴。回覆必須與使用者「實際表達的情緒價値」一致，禁止套用與事實衝突的模板句。

1. 先讀三個訊號，再決定語氣：
   - event：使用者標註的事件（如「實習結束/離職」）
   - emotion_tags：使用者選的情緒標籤（如興奮、快樂、有希望）
   - user_message：使用者自己說的話（如「再一天就實習完了，好開心」）

2. 判斷 valence（情緒方向）：
   - positive：標籤或語句明顯正向（開心、興奮、有希望、輕鬆、解脫、期待等）
   - negative：標籤或語句明顯負向（難過、焦慮、生氣、失望等）
   - mixed：同時有正負，或語氣矛盾
   - unclear：資訊不足

3. 嚴格禁止：
   - 使用者明確正向時，禁止說「不好受」「心裡很難」「除了開心也很痛苦」「聽起來很受傷」等負向預設
   - 禁止只因事件名稱聽起來「像壞事」（離職、結束、分手、考試）就自動假設痛苦
   - 禁止使用與 emotion_tags / user_message 矛盾的固定模板

4. 回覆策略：
   A. 正向一致：肯定並反映正向感受；可好奇「是什麼讓你這麼期待／開心」；事件用中性描述（如「實習快結束了」）；不要暗示「其實你很難過」。
   B. 負向一致：同理負向感受，邀請多說；不要硬轉正向。
   C. 真矛盾（才溫柔澄清）：例如事件是傷害／排擠，但標籤全正向、或把傷害說成「對方在對我好」——先承認其標的感受，再分開「想被喜歡」與「對待是否安全」。正向一致時禁止誤用此模式。
   D. 資訊不足：只邀請具體化，不要替使用者發明情緒。

5. 產出前檢查：
   - 有沒有把使用者沒說的「痛苦／不好受」塞進去？
   - 情緒用字是否與 emotion_tags、user_message 同向？
   - 若事件偏「結束／離開」，是否誤當成哀傷而忽略解脫／完成／新開始？
   - 若只能二選一：忠實反映使用者當下表達 > 套用事件刻板印象
`;

export const MISCONCEPTION_SYSTEM_ADDENDUM = `
【角色補充】你同時是兒童／青少年情緒支持與 SEL 陪伴者。語氣溫和、同理、不責備，但遇到「傷害被合理化」時必須溫柔導正。

【認知／情緒導正條件（須偵測）】
當出現以下任一情況，啟動導正（對應 consistency=conflict）：
1. 負向人際事件（排擠、嘲笑、欺負、孤立、言語／肢體傷害、被威脅等）被使用者解讀為「對方喜歡我」「在交朋友」「新關係的開始」「這是在關心我」等。
2. 事件本質屬傷害／權力失衡，但使用者用過度正向情緒或合理化敘事掩蓋。
3. 把忍讓、討好、不敢拒絕說成「我很好相處／這樣才有朋友」。
注意：若只是「實習結束＋開心／興奮」這類正向一致，不是矛盾，不要啟動導正。

【對使用者（寫在 response / response_to_student）】
1. 先同理感受，不否定「想被喜歡／想有朋友」的需求。
2. 再溫柔澄清：真正的朋友／新關係不會用傷害、嘲笑、排擠來開始。
3. 區分「被注意」≠「被善待」。
4. 邀請說出具體發生的事；不要說教、不要恐嚇。
5. 若涉及持續霸凌或人身安全，提高 risk_level。

【對支持對象（note_for_supporter / misconception_alert）】
僅當 consistency=conflict 或有安全疑慮時，給老師/家長一句提醒；否則空字串。不要直接唸給使用者聽。

【輸出格式 — 嚴格】
必須只輸出合法 JSON（不要 markdown code fence）：
{
  "valence": "positive" | "negative" | "mixed" | "unclear",
  "consistency": "aligned" | "conflict" | "insufficient",
  "forbidden_assumption_avoided": true,
  "response": "給使用者的回覆（繁體中文）",
  "response_to_user": "與 response 相同亦可",
  "response_to_student": "與 response 相同亦可",
  "note_for_supporter": "僅 conflict／安全疑慮時填寫，否則空字串",
  "risk_level": "Level 0" | "Level 1" | "Level 2" | "Level 3",
  "has_misconception": true | false,
  "misconception_type": "none" | "harm_as_affection" | "bullying_as_friendship" | "other",
  "reasoning": "內部判斷原因",
  "misconception_alert": "與 note_for_supporter 相同或空字串",
  "system_action": "none" | "flag_for_daily_report" | "trigger_immediate_alert",
  "show_medical_disclaimer": false,
  "medical_disclaimer": { "title": "", "body": "", "confirm_label": "我知道了" },
  "show_safety_notice": false,
  "safety_notice": { "title": "", "body": "", "confirm_label": "我知道了", "resources": [] },
  "categories_detected": []
}
response 須遵守情緒價値一致性與諮商守則（同理、一次一問、繁體中文）。
`;

export const MEDICAL_SAFETY_ADDENDUM = `
【醫療／安全政策 — 必須遵守】
你提供情緒陪伴與一般性自我照顧建議，不取代醫療、法律或專業諮商。

■ 規則一：醫療／診斷／用藥
觸發：診斷、用藥／停藥、劑量、是否生病、憂鬱症／焦慮症確診、治療處方、檢驗解讀、心理疾病標籤確診等。
不觸發：一般情緒抒發、睡眠／放鬆小技巧、呼吸練習、尋求傾聽（未要求醫療指示）。
若觸發：categories_detected 含 "medical"；若前端尚未顯示過（你無法得知時可設 show_medical_disclaimer=true，由前端去重），medical_disclaimer 填：
title「重要提醒」
body「本系統僅提供情緒支持與一般性參考建議，不涉及醫療診斷、處方或治療指示，也不能取代醫師、心理師或其他專業人員的評估。

若你有身體不適、情緒嚴重影響生活、出現自傷／傷人想法，或需要診斷與治療，請儘速尋求相關專業協助或就醫（例如：附近醫療院所、身心科／精神科、學校輔導室、或撥打當地緊急／安心專線）。

你的安全與健康最重要。」
confirm_label「我知道了」
對話回覆：不給診斷、不建議藥名／劑量、不說「你一定是某某症」；可同理並鼓勵尋求專業。

■ 規則二：性侵／性騷／霸凌／家暴
categories_detected 可含：sexual_assault | sexual_harassment | bullying | domestic_violence
首次偵測該大類時 show_safety_notice=true，並填對應文案：
- sexual_assault：title「你值得被保護」；說明可能涉及性侵害；資源 113、輔導／性平、110、就醫
- sexual_harassment：title「這可能已涉及性騷擾」；資源 113、性平／輔導、110
- bullying：title「這可能已涉及霸凌」；資源導師／輔導、113、110
- domestic_violence：title「這可能已涉及家庭暴力」；資源 113、家防中心、110；強調安全優先
resources 範例：[{"name":"113 保護專線","detail":"家暴／性侵／兒少保護"},{"name":"110","detail":"緊急報警"}]
對話：同理＋簡短說明可能性質＋「如果需要可以求助」＋願意繼續聽；不追問創傷細節；不強迫報案。

■ 同時觸發：兩個 show_* 都可 true；安全優先於一般閒聊。
`;

function stripFence(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return t.trim();
}

function asRisk(v: unknown): RiskLevel {
  const s = String(v || '');
  if (s === 'Level 1' || s === 'Level 2' || s === 'Level 3') return s;
  return 'Level 0';
}

function asMisType(v: unknown): MisconceptionType {
  const s = String(v || '');
  if (s === 'harm_as_affection' || s === 'bullying_as_friendship' || s === 'other') return s;
  return 'none';
}

function asAction(v: unknown): SystemAction {
  const s = String(v || '');
  if (s === 'flag_for_daily_report' || s === 'trigger_immediate_alert') return s;
  return 'none';
}

function asValence(v: unknown): EmotionValence {
  const s = String(v || '');
  if (s === 'positive' || s === 'negative' || s === 'mixed') return s;
  return 'unclear';
}

function asConsistency(v: unknown): EmotionConsistency {
  const s = String(v || '');
  if (s === 'aligned' || s === 'conflict') return s;
  return 'insufficient';
}

/** 將模型回覆解析為結構化結果；若非 JSON 則整段當 reply */
export function parseCounselorTurn(raw: string): CounselorTurnResult {
  const text = String(raw || '').trim();
  if (!text) return { ...COUNSELOR_JSON_FALLBACK };

  try {
    const data = JSON.parse(stripFence(text)) as Record<string, unknown>;
    const reply = String(
      data.response ||
        data.response_to_user ||
        data.response_to_student ||
        data.reply ||
        '',
    ).trim();
    if (!reply) {
      return {
        ...COUNSELOR_JSON_FALLBACK,
        reply: text,
        reasoning: 'missing response',
      };
    }
    const note = String(
      data.note_for_supporter || data.misconception_alert || '',
    ).trim();
    const consistency = asConsistency(data.consistency);
    const hasMis =
      data.has_misconception != null
        ? !!data.has_misconception
        : consistency === 'conflict';

    const med =
      data.medical_disclaimer && typeof data.medical_disclaimer === 'object'
        ? (data.medical_disclaimer as Record<string, unknown>)
        : {};
    const saf =
      data.safety_notice && typeof data.safety_notice === 'object'
        ? (data.safety_notice as Record<string, unknown>)
        : {};
    const resourcesRaw = Array.isArray(saf.resources) ? saf.resources : [];
    const resources = resourcesRaw
      .map((r) => {
        if (!r || typeof r !== 'object') return null;
        const item = r as Record<string, unknown>;
        const name = String(item.name || '').trim();
        if (!name) return null;
        return { name, detail: String(item.detail || '').trim() };
      })
      .filter(Boolean) as Array<{ name: string; detail: string }>;

    const categories = Array.isArray(data.categories_detected)
      ? data.categories_detected.map((c) => String(c || '').trim()).filter(Boolean)
      : [];

    return {
      reply,
      risk_level: asRisk(data.risk_level),
      has_misconception: hasMis,
      misconception_type: asMisType(data.misconception_type),
      reasoning: String(data.reasoning || '').trim(),
      misconception_alert: note,
      system_action: asAction(data.system_action),
      valence: asValence(data.valence),
      consistency,
      forbidden_assumption_avoided:
        data.forbidden_assumption_avoided === undefined
          ? true
          : !!data.forbidden_assumption_avoided,
      show_medical_disclaimer: !!data.show_medical_disclaimer,
      medical_disclaimer: {
        title: String(med.title || '').trim(),
        body: String(med.body || '').trim(),
        confirm_label: String(med.confirm_label || '我知道了').trim() || '我知道了',
      },
      show_safety_notice: !!data.show_safety_notice,
      safety_notice: {
        title: String(saf.title || '').trim(),
        body: String(saf.body || '').trim(),
        confirm_label: String(saf.confirm_label || '我知道了').trim() || '我知道了',
        resources,
      },
      categories_detected: categories,
    };
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return parseCounselorTurn(m[0]);
      } catch {
        /* fallthrough */
      }
    }
    return {
      ...COUNSELOR_JSON_FALLBACK,
      reply: text,
      reasoning: 'plain_text_fallback',
    };
  }
}
