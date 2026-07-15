/**
 * 開發者後端：將使用紀錄寫入 Google 試算表
 * 透過 Google Apps Script Web App webhook（最簡單，免服務帳號）
 */

export type SessionAnalyticsPayload = {
  nickname?: string;
  role?: string;
  schoolType?: string;
  region?: string;
  school?: string;
  email?: string;
  preScore?: number | null;
  postScore?: number | null;
  scoreDiff?: number | null;
  satisfaction?: number | null;
  feedback?: string;
  supportRelations?: string;
  /** 額外完整欄位 */
  account?: string;
  shared?: boolean;
  emotionLabels?: string;
  eventLabels?: string;
  topic?: string;
  sessionId?: string | number;
  skippedRating?: boolean;
};

export function isSheetConfigured() {
  const url = (process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
  return !!url && /^https:\/\//i.test(url);
}

export function getSheetStatus() {
  return {
    configured: isSheetConfigured(),
    webhookSet: !!(process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim(),
  };
}

function numOrEmpty(v: unknown) {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
}

function text(v: unknown, max = 2000) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

/** 寫入一列：Session 完成紀錄 */
export async function appendSessionAnalytics(payload: SessionAnalyticsPayload) {
  const url = (process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
  if (!url) {
    return { ok: false as const, reason: 'sheet_not_configured' as const };
  }

  const pre = numOrEmpty(payload.preScore);
  const post = numOrEmpty(payload.postScore);
  let diff: number | '' = numOrEmpty(payload.scoreDiff);
  if (diff === '' && typeof pre === 'number' && typeof post === 'number') {
    diff = pre - post;
  }

  const row = {
    timestamp: new Date().toISOString(),
    nickname: text(payload.nickname, 80),
    role: text(payload.role, 80),
    schoolType: text(payload.schoolType, 40),
    region: text(payload.region, 40),
    school: text(payload.school, 120),
    email: text(payload.email, 120),
    preScore: pre,
    postScore: post,
    scoreDiff: diff,
    satisfaction: numOrEmpty(payload.satisfaction),
    feedback: text(payload.feedback, 4000),
    supportRelations: text(payload.supportRelations, 500),
    account: text(payload.account, 80),
    shared: payload.shared === true ? 'Y' : payload.shared === false ? 'N' : '',
    emotionLabels: text(payload.emotionLabels, 300),
    eventLabels: text(payload.eventLabels, 300),
    topic: text(payload.topic, 200),
    sessionId: text(payload.sessionId, 64),
    skippedRating: payload.skippedRating ? 'Y' : 'N',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'appendSession', row }),
      redirect: 'follow',
    });
    const raw = await res.text();
    let data: { ok?: boolean; error?: string } = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      // Apps Script 有時回傳純文字
      if (/ok|success|寫入成功/i.test(raw)) {
        return { ok: true as const };
      }
      return {
        ok: false as const,
        reason: 'sheet_write_failed' as const,
        error: raw.slice(0, 300) || `HTTP ${res.status}`,
      };
    }
    if (data.ok === false || (res.status >= 400 && data.ok !== true)) {
      return {
        ok: false as const,
        reason: 'sheet_write_failed' as const,
        error: data.error || `HTTP ${res.status}`,
      };
    }
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false as const, reason: 'sheet_network_error' as const, error: message };
  }
}
