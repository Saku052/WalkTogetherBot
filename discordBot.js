require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const characterStatePath = path.join(__dirname, 'character_state.json');

function loadCharacterState() {
  const raw = fs.readFileSync(characterStatePath, 'utf8');
  return JSON.parse(raw);
}

function saveCharacterState(state) {
  fs.writeFileSync(characterStatePath, JSON.stringify(state, null, 2), 'utf8');
}

async function updateStateFromMessage(message) {
  const currentState = loadCharacterState();

  const prompt = `以下の投稿をもとに、さくのcharacter_stateの更新内容をJSONで返してください。
変更が必要なフィールドだけ含めてください。last_tweet_themeは絶対に含めないでください。

【現在の状態】
${JSON.stringify(currentState, null, 2)}

【投稿内容】
「${message}」

【更新できるフィールドと型】
- mood: string（例: "ほわほわ" "集中モード" "ちょっとへこみ中" "興奮気味" "散漫" "虚無"）
- energy: number（1〜5）
- current_obsession: string
- recent_happenings: array（投稿内容を先頭に追加し、最大3件に収める）
- creative_block: boolean

JSONのみ返してください。説明文は不要です。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSONが返ってきませんでした');

  const updates = JSON.parse(jsonMatch[0]);

  // recent_happeningsは配列マージではなくAIの返した値をそのまま使う
  const newState = { ...currentState, ...updates };
  saveCharacterState(newState);

  return updates;
}

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.name !== 'さく-記録') return;

  try {
    const updates = await updateStateFromMessage(msg.content);

    const lines = Object.entries(updates).map(([k, v]) => {
      const value = Array.isArray(v) ? v.join('、') : String(v);
      return `・${k}: ${value}`;
    });

    await msg.reply(`更新しました。\n${lines.join('\n')}`);
  } catch (err) {
    console.error('Discord Bot Error:', err);
    await msg.reply('更新に失敗しました。');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

console.log('Discord Bot started.');
