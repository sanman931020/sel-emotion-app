import nodemailer from 'nodemailer';

export type ShareEmailPayload = {
  recipients?: string[];
  subject?: string;
  body?: string;
};

export function isSmtpConfigured() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim().replace(/\s/g, '');
  return !!(host && user && pass);
}

export function getSmtpStatus() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim().replace(/\s/g, '');
  return {
    configured: !!(host && user && pass),
    host: host || null,
    user: user || null,
    port: Number(process.env.SMTP_PORT) || 587,
  };
}

function buildFromAddress() {
  const user = (process.env.SMTP_USER || '').trim();
  const fromRaw = (process.env.SMTP_FROM || '').trim();
  if (user) {
    return { name: '心靈夥伴', address: user };
  }
  if (fromRaw) {
    const m = fromRaw.match(/<([^>]+)>/);
    if (m) return { name: '心靈夥伴', address: m[1].trim() };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromRaw)) {
      return { name: '心靈夥伴', address: fromRaw };
    }
  }
  return { name: '心靈夥伴', address: 'noreply@localhost' };
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim().replace(/\s/g, '');
  return nodemailer.createTransport({
    host: (process.env.SMTP_HOST || '').trim(),
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: { user, pass },
  });
}

function mapSmtpError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (/BadCredentials|Username and Password not accepted|535|Invalid login|EAUTH/i.test(message)) {
    const user = (process.env.SMTP_USER || '').trim().toLowerCase();
    const looksSchool =
      /@go\./i.test(user) ||
      /\.edu(\.[a-z]+)?$/i.test(user.split('@')[1] || '') ||
      /utaipei|ntu\.edu|nccu\.edu|nthu\.edu|nycu\.edu/i.test(user);
    return {
      reason: 'auth_failed' as const,
      error: looksSchool
        ? '目前寄件帳號似乎是學校 Google（' +
          user +
          '），這類帳號通常不允許「應用程式密碼」SMTP。請改用個人 Gmail：執行 setup-smtp.ps1，填入個人 Gmail 與 16 碼應用程式密碼，再重啟 npm run dev。'
        : '信箱帳密驗證失敗。請重新執行 setup-smtp.ps1，填入 Gmail「應用程式密碼」（16 碼），不是一般登入密碼；完成後請重啟 npm run dev。',
    };
  }
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|certificate/i.test(message)) {
    return {
      reason: 'send_failed' as const,
      error: '無法連線 SMTP 伺服器：' + message,
    };
  }
  return { reason: 'send_failed' as const, error: message };
}

/** 測試 SMTP 是否可登入（不寄信） */
export async function verifySmtp() {
  if (!isSmtpConfigured()) {
    return { ok: false as const, reason: 'smtp_not_configured' as const };
  }
  const transporter = createTransporter();
  try {
    await transporter.verify();
    return { ok: true as const, ...getSmtpStatus() };
  } catch (err) {
    const mapped = mapSmtpError(err);
    return { ok: false as const, ...mapped, ...getSmtpStatus() };
  }
}

export async function sendShareEmail(payload: ShareEmailPayload) {
  const recipients = (payload.recipients || [])
    .map((e) => String(e).trim())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  if (!recipients.length) {
    return { ok: false as const, reason: 'no_valid_recipients' as const };
  }

  if (!isSmtpConfigured()) {
    return { ok: false as const, reason: 'smtp_not_configured' as const };
  }

  const transporter = createTransporter();
  try {
    await transporter.verify();
  } catch (err) {
    const mapped = mapSmtpError(err);
    return { ok: false as const, ...mapped };
  }

  const from = buildFromAddress();
  const subject = (payload.subject || '心靈夥伴｜今日心情摘要').slice(0, 200);
  const text = String(payload.body || '').slice(0, 12000);

  try {
    let sent = 0;
    for (const to of recipients) {
      await transporter.sendMail({ from, to, subject, text });
      sent += 1;
    }
    return { ok: true as const, sent };
  } catch (err) {
    const mapped = mapSmtpError(err);
    return { ok: false as const, ...mapped };
  }
}
