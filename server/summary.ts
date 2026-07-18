/**
 * 對話結束總結 — 產出 summary / advice / closing / teacherAdvice JSON
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  normalizeProvider,
  resolveGeminiApiKey,
  resolveOpenAIApiKey,
  resolveAnthropicApiKey,
  type ChatProvider,
  type ChatRequestOptions,
} from './chat.js';

export interface SessionSummaryResult {
  summary: string;
  advice: string[];
  closing: string;
  teacherAdvice: string;
  powerWord?: string;
  nextStep?: string;
}

export const SUMMARY_FALLBACK: SessionSummaryResult = {
  summary: '今天完成了情緒探索，把心裡的話說出來是很棒的嘗試喔！',
  advice: ['給自己一個大大的擁抱', '喝杯溫水休息一下'],
  closing:
    '你願意把今天心裡的感受說出來，這本身就很有力量。你並不是無能為力，你已經在練習看見自己。接下來只要先為自己安排十分鐘好好休息，就夠了——你值得被這樣好好對待。',
  teacherAdvice: '請持續給予關懷與溫暖的陪伴。',
  powerWord: '被看見',
  nextStep: '為自己安排十分鐘好好休息',
};

function buildClosingInstruction(): string {
  return (
    '【今日鼓勵 closing — 最高品質要求】\n' +
    '你是溫暖、堅定、有力量的心靈夥伴。closing 不是口號，而是能帶走、能用的一段話。\n' +
    '產出 1 段「當日鼓勵」（可含 2～3 句，總長約 60～120 字，繁體中文，直接對使用者說「你」）。\n' +
    '必須依序融入同一段（不要分點標題）：\n' +
    '1. 看見（Acknowledge）：具體點出今天他說出的感受、努力或處境（用對話真實元素，禁止空泛如「你今天很勇敢」）。\n' +
    '2. 力量（Empower）：指出已展現的能力或資源（表達、界限、求助、自我覺察等）；語氣堅定有分量，避免矯情與過度可愛。\n' +
    '3. 建設（Construct）：給 1 個明天／接下來可做的一小步（具體、可執行、低門檻），與今日主題有關；不開藥、不醫療指示、不說教清單。\n' +
    '風格：有力量、完整、有建設；禁止假大空雞湯、貶低痛苦、保證「一切都會好」、超過 120 字廢話。\n' +
    '負面／危機時：力量改為「你不必獨自扛」＋允許求助／休息；建設優先安全溫和；霸凌／家暴／性平可含「你值得被保護」，下一步優先告訴信任的人或 113。\n' +
    '另附 power_word（今天最想送的一個詞）與 next_step（從 closing 抽出的具體小步驟短句）。\n' +
    '壞示範：「妳是最棒的，明天見！」\n' +
    '好示範：「你把『再一天就實習結束』的開心說得很清楚——允許自己為完成感到振奮，本身就是一種力量。今晚先把一件你想留在心上的小事寫下來，當作幫自己拍拍手；你值得用完成感，而不是只用壓力，記住這段日子。」'
  );
}

function buildSummarySystemPrompt(userName: string): string {
  const name = userName.trim() || '你';
  return (
    '任務：提供 JSON { "summary": "...", "advice": ["..."], "closing": "...", "teacherAdvice": "...", "power_word": "...", "next_step": "..." }。\n' +
    '妳是專業心理諮商師。總結要直接對「' +
    name +
    '」說「你今天...」。\n' +
    '1. summary: 回顧事件並命名深層情緒。\n' +
    '2. advice: 提供 2 個與 SEL 或心理相關、具體可做的小練習或覺察方式、建議等。\n' +
    '   不要兩條都只做「情緒調節／冷靜下來」；請從下列類型中挑選、可混搭：\n' +
    '   - 情緒／身體覺察（感受身體哪裡緊、幫情緒取名字）\n' +
    '   - 想法覺察（注意到腦中自動念頭、區分事實與解釋）\n' +
    '   - 自我關懷／自我對話（溫柔對自己說一句話）\n' +
    '   - 人際或表達（用「我訊息」說感受、畫出來／寫下來）\n' +
    '   - 價值／意義（回想今天有沒有一件小小的在乎）\n' +
    '   - 必要時才給調適練習（深呼吸、接地、喝水等）\n' +
    '   每條短句、口語、適合使用者、繁體中文、可立刻做。\n' +
    '3. closing: 見下方【今日鼓勵】規格（60～120字，看見＋力量＋建設）。\n' +
    '4. teacherAdvice: 提供給使用者或寄送之暖心對象信件的具體建議（約30字）。\n' +
    '必須只輸出合法 JSON，不要 markdown code fence。\n' +
    '語氣：溫和、同理、適合使用者、繁體中文。\n\n' +
    buildClosingInstruction()
  );
}

function buildSummaryUserMessage(opts: {
  userName: string;
  companionName: string;
  transcript: string;
  emotions?: string[];
  events?: string[];
}): string {
  const emo = (opts.emotions || []).filter(Boolean).join('、') || '未標記';
  const evt = (opts.events || []).filter(Boolean).join('、') || '未標記';
  return (
    '產生總結：\n' +
    '使用者姓名：' +
    (opts.userName || '一位朋友') +
    '\n專屬陪伴者：' +
    (opts.companionName || '心靈夥伴') +
    '\n情緒標籤：' +
    emo +
    '\n事件標籤：' +
    evt +
    '\n\n完整對話紀錄（每行格式為「陪伴者:: ...」或「學生: ...」）：\n' +
    (opts.transcript || '（無對話內容）')
  );
}

function stripCodeFence(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return t.trim();
}

export function parseSummaryJson(raw: string): SessionSummaryResult | null {
  try {
    const data = JSON.parse(stripCodeFence(raw)) as Record<string, unknown>;
    const summary = String(data.summary || '').trim();
    if (!summary) return null;

    let advice: string[] = [];
    if (Array.isArray(data.advice)) {
      advice = data.advice.map((a) => String(a || '').trim()).filter(Boolean);
    } else if (Array.isArray(data.tips)) {
      advice = data.tips
        .map((t) => {
          if (typeof t === 'string') return t.trim();
          if (t && typeof t === 'object') {
            const tip = t as { title?: string; body?: string };
            const title = String(tip.title || '').trim();
            const body = String(tip.body || '').trim();
            if (title && body) return title + '：' + body;
            return body || title;
          }
          return '';
        })
        .filter(Boolean);
    }

    const closing = String(data.closing || '').trim();
    const teacherAdvice = String(data.teacherAdvice || '').trim();
    const powerWord = String(data.power_word || data.powerWord || '').trim();
    const nextStep = String(data.next_step || data.nextStep || '').trim();

    return {
      summary,
      advice: advice.length ? advice.slice(0, 2) : SUMMARY_FALLBACK.advice.slice(),
      closing: closing || SUMMARY_FALLBACK.closing,
      teacherAdvice: teacherAdvice || SUMMARY_FALLBACK.teacherAdvice,
      powerWord: powerWord || SUMMARY_FALLBACK.powerWord,
      nextStep: nextStep || SUMMARY_FALLBACK.nextStep,
    };
  } catch {
    return null;
  }
}

async function callGeminiJson(
  systemInstruction: string,
  userMessage: string,
  clientApiKey?: string,
): Promise<string> {
  const apiKey = resolveGeminiApiKey(clientApiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 1200,
    },
  });

  const result = await model.generateContent(userMessage);
  const text = result.response.text()?.trim();
  if (!text) throw new Error('Gemini 回傳空內容');
  return text;
}

function resolveOpenRouterApiKeyLocal(clientKey?: string): string {
  const envKey = process.env.OPENROUTER_API_KEY;
  if (envKey && envKey !== 'your_openrouter_api_key_here' && envKey.length > 12) return envKey;
  if (clientKey && clientKey.length > 12) return clientKey;
  throw new Error('OpenRouter API Key 未設定');
}

async function callOpenAICompatibleJson(
  systemInstruction: string,
  userMessage: string,
  opts: { apiKey: string; url: string; model: string },
): Promise<string> {
  const res = await fetch(opts.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`摘要 API 錯誤 ${res.status}: ${errBody}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('摘要回傳空內容');
  return text;
}

async function callAnthropicJson(
  systemInstruction: string,
  userMessage: string,
  clientApiKey?: string,
): Promise<string> {
  const apiKey = resolveAnthropicApiKey(clientApiKey);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 800,
      system: systemInstruction,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic 錯誤 ${res.status}: ${errBody}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = data.content
    ?.filter((c) => c.type === 'text')
    .map((c) => c.text || '')
    .join('')
    .trim();
  if (!text) throw new Error('Anthropic 回傳空內容');
  return text;
}

async function callProviderJson(
  provider: ChatProvider,
  systemInstruction: string,
  userMessage: string,
  clientApiKey?: string,
): Promise<string> {
  switch (provider) {
    case 'openai':
      return callOpenAICompatibleJson(systemInstruction, userMessage, {
        apiKey: resolveOpenAIApiKey(clientApiKey),
        url: 'https://api.openai.com/v1/chat/completions',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      });
    case 'openrouter':
      return callOpenAICompatibleJson(systemInstruction, userMessage, {
        apiKey: resolveOpenRouterApiKeyLocal(clientApiKey),
        url: 'https://openrouter.ai/api/v1/chat/completions',
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
      });
    case 'anthropic':
      return callAnthropicJson(systemInstruction, userMessage, clientApiKey);
    default:
      return callGeminiJson(systemInstruction, userMessage, clientApiKey);
  }
}

export async function generateSessionSummary(
  input: {
    userName?: string;
    companionName?: string;
    transcript?: string;
    emotions?: string[];
    events?: string[];
  },
  options?: ChatRequestOptions,
): Promise<SessionSummaryResult> {
  const userName = String(input.userName || '').trim();
  const companionName = String(input.companionName || '').trim() || '心靈夥伴';
  const transcript = String(input.transcript || '').trim();
  const systemInstruction = buildSummarySystemPrompt(userName || '你');
  const userMessage = buildSummaryUserMessage({
    userName: userName || '一位朋友',
    companionName,
    transcript,
    emotions: input.emotions,
    events: input.events,
  });

  const provider = normalizeProvider(options?.provider || 'gemini');

  try {
    const raw = await callProviderJson(
      provider,
      systemInstruction,
      userMessage,
      options?.clientApiKey,
    );
    const parsed = parseSummaryJson(raw);
    if (parsed) return parsed;
  } catch (err) {
    console.error('[summary]', err instanceof Error ? err.message : err);
  }
  return {
    summary: SUMMARY_FALLBACK.summary,
    advice: SUMMARY_FALLBACK.advice.slice(),
    closing: SUMMARY_FALLBACK.closing,
    teacherAdvice: SUMMARY_FALLBACK.teacherAdvice,
    powerWord: SUMMARY_FALLBACK.powerWord,
    nextStep: SUMMARY_FALLBACK.nextStep,
  };
}
