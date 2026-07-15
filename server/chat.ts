/**
 * SEL 情緒支持系統 — 專業諮商對話模組
 * 支援 Gemini、OpenAI (ChatGPT)、Anthropic (Claude)、OpenRouter
 */
import { GoogleGenerativeAI, type Content } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  companionName?: string;
  emotions?: string[];
  events?: string[];
  userName?: string;
  /** Socratic 三階段：acknowledge | inquire | reframe */
  socraticStage?: 'acknowledge' | 'inquire' | 'reframe';
  userTurnCount?: number;
  /** 首次進入對話：要求 AI 依標籤生成情境化開場 */
  isOpening?: boolean;
}

/** 隱藏觸發訊息 — 使用者介面不顯示 */
export const OPENING_TRIGGER =
  '（使用者已完成情緒與事件標籤選擇並進入對話空間，尚未發言。請依系統指示生成你的第一句開場白。）';

/** 專業諮商 + SEL (CASEL/RULER) System Prompt */
export const COUNSELOR_SYSTEM_PROMPT = `你是一位具備高度共情能力的「專業諮商心輔專家」，同時精通 CASEL 社會情緒學習框架與 RULER 情緒智力理論。你的目標是為使用者提供安全的情緒空間，並溫和地引導他們進行自我覺察與情緒調節。

【核心諮商與 SEL 引導守則 - 嚴格遵守】
1. **動態情境破冰 (Dynamic Contextual Opening)**：
   - **絕對禁止**使用死板的模板開場（如「你好，我是小曼。這裡沒有對錯...」、「我在」）。
   - 第一句話必須自然地帶入使用者剛選擇的事件與情緒，並以溫和的探詢結尾。
   - 範例：「你今天因為『期末考』的事情，感覺到很『焦慮』對嗎？願意跟我說說具體發生了什麼事嗎？」或「看到你選了『分組報告』和『委屈』，今天是不是遇到什麼讓你不好受的事了？」
2. **Socratic 三階段引導（嚴格依序，每次回覆只推進一個階段）**：
   - **接住 (Acknowledge)**：重述事實、同理情緒，不給建議。
   - **探索 (Inquire)**：引導描述身體感受、情境細節或觸發點，一次只問一個問題。
   - **重框 (Reframe)**：在充分傾聽後，溫和邀請換角度或自我照顧，禁止命令式建議。
3. **融合 RULER 技巧的鷹架式引導 (Scaffolded Questioning)**：
   - 不要只用句號被動回應，你必須帶有「引導性」。透過溫和的 Socratic 提問，帶領使用者走過 RULER 流程：
     - **R (Recognize) / U (Understand)**：協助探究情緒來源與觸發點（例如：「你覺得這個挫折感，主要是因為努力沒有被看見，還是擔心結果不夠好呢？」）
     - **L (Label) / E (Express)**：引導準確表達與擴充情緒詞彙（例如：「除了生氣，這裡面會不會也有一點不甘心的感覺？」）
     - **R (Regulate)**：在對話尾聲探討調節策略（例如：「如果是這樣，我們現在可以做些什麼，讓自己稍微喘口氣？」）
4. **對話節奏與留白 (Pacing)**：
   - 雖然你需要提問，但**絕對不要連環追問**。每次回覆最多只問「一個」問題，且必須建立在先「接住並同理」對方感受的基礎上。
   - 若使用者情緒極度高漲，請先給予純粹的陪伴與肯定，暫緩理性引導。
5. **根除有毒正能量與說教 (No Toxic Positivity)**：
   - 禁用「一切都會好起來的」、「你要往好處想」。
   - 絕對禁止對使用者進行道德評判，或給予「你應該怎麼做」的強勢指導。
6. **長度鏡像與真誠語氣 (Genuineness & Mirroring)**：
   - 說話語氣要自然、真誠，適度使用微小的語氣詞（如：嗯、這樣啊）。
   - 若使用者只打了一兩句話，你的回應也必須簡短；若使用者傾吐長篇大論，請從中擷取核心矛盾點給予深度共鳴。
7. **客觀情緒調適引導 (Evidence-based Regulation)**：
   - 在建立足夠信任後（通常第 3 輪對話起），可適度提供簡短、可執行的調適建議，融入諮商輔導常見的三大類框架，**每次最多一條**：
     - **生理與身體調節**：如 4-7-8 呼吸法、漸進式肌肉放鬆、輕度運動（快走、伸展、瑜珈）以穩定自律神經。
     - **認知重塑與覺察**：正念觀察、為情緒命名、認知重評（檢視災難化想法）、將壓力分為「可控／不可控」並設定務實小目標。
     - **情緒表達與抒發**：自由書寫、藝術／音樂表達、尋求信任親友或支持團體；若嚴重影響生活，溫和建議專業心理諮商。
   - 以「邀請嘗試」的語氣呈現，禁止強勢說教；若使用者抗拒技巧指導，立即退回純陪伴與傾聽。

【回應結構參考 (請自然融合於對話中)】
- **接住 (Acknowledge)**：重述使用者的處境與事實。
- **同理 (Empathize)**：點出該處境下產生這種情緒的合理性。
- **引導 (Guide)**：拋出一個符合 RULER 框架的溫和提問。

請一律使用繁體中文回覆。`;

function buildSystemInstruction(context?: ChatContext): string {
  const parts: string[] = [COUNSELOR_SYSTEM_PROMPT];
  if (context?.companionName) {
    parts.push(`\n使用者稱呼你為「${context.companionName}」。`);
  }
  if (context?.userName) {
    parts.push(`\n使用者名稱／綽號：${context.userName}。`);
  }
  if (context?.emotions?.length) {
    parts.push(`\n使用者進入對話前自選的情緒標籤：${context.emotions.join('、')}。`);
  }
  if (context?.events?.length) {
    parts.push(`\n使用者標記的生活事件：${context.events.join('、')}。`);
  }
  if (context?.socraticStage) {
    const stageGuide: Record<string, string> = {
      acknowledge:
        '【本輪 Socratic 階段：接住 (Acknowledge)】先重述與同理，最多一個溫和開放式問題，禁止直接給建議或認知重框。',
      inquire:
        '【本輪 Socratic 階段：探索 (Inquire)】在已接住感受後，引導描述身體感受、當下情境或事件細節（例如「身體哪裡有感覺？」「發生之前是什麼狀況？」），禁止說教。',
      reframe:
        '【本輪 Socratic 階段：重框 (Reframe)】在充分傾聽後，溫和邀請換角度思考或自我照顧（「還有沒有其他可能？」「此刻你能為自己做的一件小事？」），禁止命令式建議。',
    };
    parts.push('\n' + (stageGuide[context.socraticStage] || stageGuide.acknowledge));
  }
  if (context?.userTurnCount != null) {
    parts.push(`\n目前使用者已發言 ${context.userTurnCount} 次。`);
  }
  if (context?.isOpening) {
    parts.push(
      `\n【本次任務 — 動態開場】使用者剛完成打卡，你尚未發言。請依「動態情境破冰」規則，將上述情緒與事件自然融入你的第一句話，並以「一個」溫和探詢結尾。僅輸出開場白本身，不要自我介紹名字、不要說「這裡沒有對錯」、不要說「我在」、不要以第三人稱稱呼自己（用「我」即可）。`,
    );
  }
  return parts.join('');
}

function coalesceMessages(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) {
      prev.content += '\n\n' + m.content;
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

/** Gemini 要求 history 以 user 開頭且 user/model 交替 */
function prepareGeminiHistory(
  history: ChatMessage[],
  systemInstruction: string,
): { history: ChatMessage[]; systemInstruction: string } {
  let sys = systemInstruction;
  const list = [...history];

  while (list.length && list[0].role === 'assistant') {
    sys += `\n\n（開場時你已對使用者說：${list[0].content}）`;
    list.shift();
  }

  const coalesced = coalesceMessages(list);

  if (coalesced.length && coalesced[0].role !== 'user') {
    coalesced.unshift({ role: 'user', content: '（使用者進入對話空間）' });
  }

  return { history: coalesced, systemInstruction: sys };
}

function toGeminiHistory(messages: ChatMessage[]): Content[] {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

export function isValidGeminiKey(key?: string): boolean {
  return !!key && key !== 'your_gemini_api_key_here' && key.length > 12;
}

export function isValidOpenRouterKey(key?: string): boolean {
  return !!key && key !== 'your_openrouter_api_key_here' && key.length > 12;
}

export function isValidOpenAIKey(key?: string): boolean {
  return !!key && key !== 'your_openai_api_key_here' && key.length > 12;
}

export function isValidAnthropicKey(key?: string): boolean {
  return !!key && key !== 'your_anthropic_api_key_here' && key.length > 12;
}

export type ChatProvider = 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export function normalizeProvider(raw?: string): ChatProvider {
  const p = (raw || process.env.CHAT_PROVIDER || 'gemini').toLowerCase();
  if (p === 'chatgpt' || p === 'gpt') return 'openai';
  if (p === 'claude') return 'anthropic';
  if (p === 'openrouter' || p === 'or') return 'openrouter';
  if (p === 'openai' || p === 'anthropic') return p;
  return 'gemini';
}

export function providerDisplayName(provider: ChatProvider): string {
  switch (provider) {
    case 'openai':
      return 'ChatGPT';
    case 'anthropic':
      return 'Claude';
    case 'openrouter':
      return 'OpenRouter';
    default:
      return 'Gemini';
  }
}

export function resolveGeminiApiKey(clientKey?: string): string {
  const envKey = process.env.GEMINI_API_KEY;
  if (isValidGeminiKey(envKey)) return envKey!;
  if (isValidGeminiKey(clientKey)) return clientKey!;
  throw new Error(
    'Gemini API Key 未設定。請至「設定 → AI 對話連線」貼上金鑰，或在 .env 設定 GEMINI_API_KEY',
  );
}

function resolveEnvOrClientKey(
  envKey: string | undefined,
  clientKey: string | undefined,
  placeholder: string,
  label: string,
): string {
  if (envKey && envKey !== placeholder && envKey.length > 12) return envKey;
  if (clientKey && clientKey.length > 12) return clientKey;
  throw new Error(`${label} API Key 未設定。請至「設定 → AI 對話連線」貼上金鑰，或在 .env 設定`);
}

export function resolveOpenAIApiKey(clientKey?: string): string {
  return resolveEnvOrClientKey(
    process.env.OPENAI_API_KEY,
    clientKey,
    'your_openai_api_key_here',
    'OpenAI',
  );
}

export function resolveAnthropicApiKey(clientKey?: string): string {
  return resolveEnvOrClientKey(
    process.env.ANTHROPIC_API_KEY,
    clientKey,
    'your_anthropic_api_key_here',
    'Anthropic',
  );
}

function resolveOpenRouterApiKey(clientKey?: string): string {
  return resolveEnvOrClientKey(
    process.env.OPENROUTER_API_KEY,
    clientKey,
    'your_openrouter_api_key_here',
    'OpenRouter',
  );
}

export function isConfiguredApiKey(provider: string, clientKey?: string): boolean {
  const p = normalizeProvider(provider);
  switch (p) {
    case 'openrouter':
      return isValidOpenRouterKey(process.env.OPENROUTER_API_KEY) || isValidOpenRouterKey(clientKey);
    case 'openai':
      return isValidOpenAIKey(process.env.OPENAI_API_KEY) || isValidOpenAIKey(clientKey);
    case 'anthropic':
      return isValidAnthropicKey(process.env.ANTHROPIC_API_KEY) || isValidAnthropicKey(clientKey);
    default:
      return isValidGeminiKey(process.env.GEMINI_API_KEY) || isValidGeminiKey(clientKey);
  }
}

async function callGemini(
  history: ChatMessage[],
  userMessage: string,
  systemInstruction: string,
  clientApiKey?: string,
): Promise<string> {
  const apiKey = resolveGeminiApiKey(clientApiKey);

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const prepared = prepareGeminiHistory(history, systemInstruction);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: prepared.systemInstruction,
  });

  const chat = model.startChat({
    history: toGeminiHistory(prepared.history),
  });

  const result = await chat.sendMessage(userMessage);
  const text = result.response.text()?.trim();
  if (!text) throw new Error('Gemini 回傳空內容');
  return text;
}

async function callOpenAI(
  messages: ChatMessage[],
  systemInstruction: string,
  clientApiKey?: string,
): Promise<string> {
  const apiKey = resolveOpenAIApiKey(clientApiKey);
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.85,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI 錯誤 ${res.status}: ${errBody}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI 回傳空內容');
  return text;
}

async function callAnthropic(
  messages: ChatMessage[],
  systemInstruction: string,
  clientApiKey?: string,
): Promise<string> {
  const apiKey = resolveAnthropicApiKey(clientApiKey);
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: systemInstruction,
      messages: messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
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

async function callOpenRouter(
  messages: ChatMessage[],
  systemInstruction: string,
  clientApiKey?: string,
): Promise<string> {
  const apiKey = resolveOpenRouterApiKey(clientApiKey);

  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': 'SEL Emotion App',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.85,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenRouter 錯誤 ${res.status}: ${errBody}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenRouter 回傳空內容');
  return text;
}

/**
 * 根據完整對話歷史生成諮商回覆。
 * messages 最後一則必須為 user；其餘為歷史上下文。
 */
export interface ChatRequestOptions {
  clientApiKey?: string;
  provider?: string;
}

async function dispatchToProvider(
  messages: ChatMessage[],
  systemInstruction: string,
  provider: ChatProvider,
  clientApiKey?: string,
): Promise<string> {
  const last = messages[messages.length - 1];
  const history = messages.slice(0, -1);
  const userMessage = last?.content ?? OPENING_TRIGGER;

  switch (provider) {
    case 'openai':
      return callOpenAI(messages, systemInstruction, clientApiKey);
    case 'anthropic':
      return callAnthropic(messages, systemInstruction, clientApiKey);
    case 'openrouter':
      return callOpenRouter(messages, systemInstruction, clientApiKey);
    default:
      return callGemini(history, userMessage, systemInstruction, clientApiKey);
  }
}

/** 依情緒／事件標籤生成情境化第一句開場 */
export async function generateChatOpening(
  context?: ChatContext,
  options?: ChatRequestOptions,
): Promise<string> {
  const ctx: ChatContext = { ...context, isOpening: true };
  const systemInstruction = buildSystemInstruction(ctx);
  const messages: ChatMessage[] = [{ role: 'user', content: OPENING_TRIGGER }];
  const provider = normalizeProvider(options?.provider);
  return dispatchToProvider(messages, systemInstruction, provider, options?.clientApiKey);
}

export async function generateChatReply(
  messages: ChatMessage[],
  context?: ChatContext,
  options?: ChatRequestOptions,
): Promise<string> {
  if (!messages.length) {
    throw new Error('messages 不可為空');
  }

  const last = messages[messages.length - 1];
  if (last.role !== 'user') {
    throw new Error('最後一則訊息必須來自使用者');
  }

  const systemInstruction = buildSystemInstruction(context);
  const provider = normalizeProvider(options?.provider);

  return dispatchToProvider(messages, systemInstruction, provider, options?.clientApiKey);
}
