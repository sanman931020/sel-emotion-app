/**
 * 測試動態情境開場
 * 執行：npx tsx server/test-opening.ts
 */
import 'dotenv/config';
import { generateChatOpening } from './chat.js';

async function main() {
  const context = {
    companionName: '心靈夥伴',
    emotions: ['被背叛的'],
    events: ['朋友之間發生誤會'],
  };

  console.log('── 情境標籤 ──');
  console.log('事件：', context.events.join('、'));
  console.log('情緒：', context.emotions.join('、'));
  console.log('\n── AI 動態開場白 ──\n');

  try {
    const reply = await generateChatOpening(context);
    console.log(reply);
  } catch (err) {
    console.error('API 呼叫失敗:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
