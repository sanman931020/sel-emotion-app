/**
 * 模擬測試：驗證專業諮商語氣
 * 執行：npm run test:chat
 */
import 'dotenv/config';
import { generateChatReply } from './chat.js';

const TEST_USER_MESSAGE =
  '我最近準備考試準備到覺得自己好沒用，不管怎麼背都記不起來，真的很想放棄';

async function main() {
  const messages = [
    {
      role: 'assistant' as const,
      content: '你好，我是你的心靈夥伴。\n\n這裡沒有對錯，你想說什麼都可以。\n\n我在。',
    },
    { role: 'user' as const, content: TEST_USER_MESSAGE },
  ];

  console.log('── 使用者輸入 ──');
  console.log(TEST_USER_MESSAGE);
  console.log('\n── AI 回覆（Gemini / OpenRouter）──\n');

  try {
    const reply = await generateChatReply(messages, {
      companionName: '心靈夥伴',
      emotions: ['焦慮', '無力'],
      events: ['學業壓力'],
    });
    console.log(reply);
  } catch (err) {
    console.error('API 呼叫失敗:', err instanceof Error ? err.message : err);
    console.log('\n── 離線模擬回覆（依 System Prompt 原則撰寫）──\n');
    console.log(
      '嗯，準備考試準備到覺得自己好沒用，不管怎麼背都記不起來——聽起來你已經在這裡耗了很久，卻一直得不到想要的回報。\n\n' +
        '記憶卡關的時候，那種「是不是我不夠好」的聲音會特別大，甚至會讓人想直接放棄。面對這麼密集的準備，會覺得撐不下去，其實很可以理解。\n\n' +
        '我陪你在這裡待一下。',
    );
    process.exit(1);
  }
}

main();
