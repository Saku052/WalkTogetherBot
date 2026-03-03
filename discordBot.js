require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000);
}

async function summarizeContent(message) {
  const urlMatch = message.match(/https?:\/\/[^\s]+/);

  let contentToSummarize = message;

  if (urlMatch) {
    try {
      const html = await fetchUrl(urlMatch[0]);
      const text = extractText(html);
      contentToSummarize = `URL: ${urlMatch[0]}\n本文抜粋: ${text}`;
    } catch {
      // fetch失敗時はURLのみで要約
      contentToSummarize = `URL: ${urlMatch[0]}`;
    }
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `以下の内容を、さくというゲームクリエイターの「最近の出来事や関心」として15〜30文字程度の日本語で要約してください。
体言止めか短い文で。説明文は不要です。要約テキストのみ返してください。

【内容】
${contentToSummarize}`
    }],
    max_tokens: 100,
    temperature: 0.3,
  });

  return response.choices[0].message.content.trim();
}

async function updateStateFromMessage(message) {
  const currentState = loadCharacterState();

  const summary = await summarizeContent(message);

  const prompt = `以下の要約をもとに、さくのcharacter_stateの更新内容をJSONで返してください。
変更が必要なフィールドだけ含めてください。last_tweet_themeは絶対に含めないでください。
フィールドの値には要約テキストをそのまま使ってください。投稿の生テキストは使わないでください。

【現在の状態】
${JSON.stringify(currentState, null, 2)}

【要約】
「${summary}」

【更新できるフィールドと型】
- mood: string（例: "ほわほわ" "集中モード" "ちょっとへこみ中" "興奮気味" "散漫" "虚無"）
- energy: number（1〜5）
- current_obsession: string
- recent_happenings: array（要約を先頭に追加し、最大3件に収める）
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
