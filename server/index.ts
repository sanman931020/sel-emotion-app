import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateChatReply, generateChatOpening, type ChatMessage, type ChatContext, isConfiguredApiKey, isValidGeminiKey, normalizeProvider, providerDisplayName } from './chat.js';
import { sendShareEmail, verifySmtp, getSmtpStatus } from './share-email.js';
import { appendSessionAnalytics, getSheetStatus, isSheetConfigured } from './analytics-sheet.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = process.env.VERCEL ? process.cwd() : path.join(__dirname, '..');
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

/** 專業諮商對話 API — 保留完整 chat history */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context, clientApiKey, provider, opening } = req.body as {
      messages?: ChatMessage[];
      context?: ChatContext;
      clientApiKey?: string;
      provider?: string;
      opening?: boolean;
    };
    const headerKey = req.headers['x-api-key'] || req.headers['x-gemini-key'];
    const headerProvider = req.headers['x-chat-provider'];
    const apiKey =
      (typeof clientApiKey === 'string' && clientApiKey) ||
      (typeof headerKey === 'string' && headerKey) ||
      undefined;
    const chatProvider =
      (typeof provider === 'string' && provider) ||
      (typeof headerProvider === 'string' && headerProvider) ||
      undefined;

    if (opening) {
      const reply = await generateChatOpening(context, {
        clientApiKey: apiKey,
        provider: chatProvider,
      });
      res.json({ reply });
      return;
    }

    if (!messages?.length) {
      res.status(400).json({ error: 'messages 為必填陣列' });
      return;
    }

    const reply = await generateChatReply(messages, context, {
      clientApiKey: apiKey,
      provider: chatProvider,
    });
    res.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : '對話生成失敗';
    console.error('[api/chat]', message);
    res.status(500).json({ error: message });
  }
});

/** 本機開發：將 .env 的 Gemini Key 同步至瀏覽器 localStorage（僅 localhost） */
app.get('/api/bootstrap-gemini-key', (req, res) => {
  const host = req.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    res.status(403).json({ error: '僅限本機開發使用' });
    return;
  }
  const envKey = process.env.GEMINI_API_KEY;
  if (isValidGeminiKey(envKey)) {
    res.json({ key: envKey, provider: 'gemini' });
    return;
  }
  res.json({ key: null });
});

function getFirebaseWebConfig() {
  const apiKey = process.env.FIREBASE_API_KEY;
  const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const appId = process.env.FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  };
}

/** 郵件自動寄送是否已設定 */
app.get('/api/email/config', async (_req, res) => {
  const status = getSmtpStatus();
  if (!status.configured) {
    res.json({ smtpConfigured: false, autoSendEnabled: false, verified: false });
    return;
  }
  const verified = await verifySmtp();
  res.json({
    smtpConfigured: true,
    autoSendEnabled: verified.ok === true,
    verified: verified.ok === true,
    host: status.host,
    user: status.user,
    error: verified.ok ? undefined : ('error' in verified ? verified.error : undefined),
    reason: verified.ok ? undefined : verified.reason,
  });
});

/** 測試 SMTP 連線（不寄信） */
app.post('/api/email/verify', async (_req, res) => {
  const result = await verifySmtp();
  if (!result.ok) {
    res.status(result.reason === 'smtp_not_configured' ? 503 : 400).json(result);
    return;
  }
  res.json(result);
});

/** Google 試算表分析後端是否已設定 */
app.get('/api/analytics/config', (_req, res) => {
  res.json(getSheetStatus());
});

/** 寫入一筆對話／滿意度分析到 Google 試算表 */
app.post('/api/analytics/session', async (req, res) => {
  try {
    if (!isSheetConfigured()) {
      res.status(503).json({ ok: false, reason: 'sheet_not_configured' });
      return;
    }
    const result = await appendSessionAnalytics(req.body || {});
    if (!result.ok) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : '寫入試算表失敗';
    console.error('[api/analytics/session]', message);
    res.status(500).json({ ok: false, reason: 'sheet_write_failed', error: message });
  }
});

/** 分享心情摘要給暖心支持對象（需設定 SMTP） */
app.post('/api/share-email', async (req, res) => {
  try {
    const { recipients, subject, body } = req.body as {
      recipients?: string[];
      subject?: string;
      body?: string;
    };
    const result = await sendShareEmail({ recipients, subject, body });
    if (!result.ok) {
      const status =
        result.reason === 'smtp_not_configured' ? 503 :
        result.reason === 'auth_failed' ? 401 : 400;
      res.status(status).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : '寄信失敗';
    console.error('[api/share-email]', message);
    res.status(500).json({ ok: false, reason: 'send_failed', error: message });
  }
});

/** Google / Firebase 登入設定（不含密鑰） */
app.get('/api/auth/config', (_req, res) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const validClientId =
    clientId && clientId !== 'your_google_client_id.apps.googleusercontent.com';
  const firebaseConfig = getFirebaseWebConfig();
  const googleEnabled = !!(validClientId || firebaseConfig);
  res.json({
    googleEnabled,
    googleClientId: validClientId ? clientId : null,
    firebaseConfig,
    authMethod: firebaseConfig ? 'firebase' : validClientId ? 'gsi' : null,
  });
});

/** 健康檢查 */
app.get('/api/health', (req, res) => {
  const queryProvider = typeof req.query.provider === 'string' ? req.query.provider : undefined;
  const headerProvider = req.headers['x-chat-provider'];
  const provider = normalizeProvider(
    queryProvider || (typeof headerProvider === 'string' ? headerProvider : undefined),
  );
  const headerKey = req.headers['x-api-key'] || req.headers['x-gemini-key'];
  const clientKey = typeof headerKey === 'string' ? headerKey : undefined;
  const configured = isConfiguredApiKey(provider, clientKey);
  res.json({
    ok: true,
    provider,
    providerLabel: providerDisplayName(provider),
    configured,
    server: true,
  });
});

/** 靜態檔案（emotion-app.html 等） */
app.use(express.static(rootDir));
app.get('/', (_req, res) => {
  res.sendFile(path.join(rootDir, 'emotion-app.html'));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    const provider = normalizeProvider();
    console.log(`SEL App 伺服器運行中 → http://localhost:${PORT}`);
    console.log(`對話 API → POST http://localhost:${PORT}/api/chat`);
    console.log(`Provider → ${providerDisplayName(provider)} (${provider})`);
  });
}
