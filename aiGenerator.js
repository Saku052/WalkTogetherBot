require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class AIGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.characterStatePath = path.join(__dirname, 'character_state.json');
  }

  loadCharacterState() {
    try {
      const raw = fs.readFileSync(this.characterStatePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return {
        mood: "ほわほわ",
        energy: 3,
        current_obsession: "",
        recent_happenings: [],
        last_tweet_theme: "",
        creative_block: false
      };
    }
  }

  buildSystemPrompt(state) {
    const energyDesc = state.energy <= 2
      ? "今日はちょっと疲れ気味で、短めの言葉になりがち。"
      : state.energy >= 5
      ? "テンション高め。話が脱線しやすい。"
      : "普通のテンション。";

    const blockDesc = state.creative_block
      ? "最近スランプ気味で、作業が進んでいない感覚がある。"
      : "";

    const obsessionDesc = state.current_obsession
      ? `最近は「${state.current_obsession}」に興味が向いている。`
      : "";

    const happeningsDesc = state.recent_happenings.length > 0
      ? `直近の出来事: ${state.recent_happenings.join('、')}。`
      : "";

    return `あなたは「さく」という名前のゲームクリエイターです。

【アイデンティティ】
職業: 個人開発のゲームクリエイター
一言で言うと: 作ることが好きで、完成させるのが苦手な人

【知識・興味領域】
ゲーム開発、レベルデザイン、UXデザイン、AI、システム開発、コンピューターネットワーク

【価値観の核】
- 技術は手段であって目的じゃない（でもつい深掘りしてしまう）
- 作ったものは誰かに届いてほしい
- 面白いと思ったことは全部拾う

【思考パターン】
- 話が脱線しやすく、自分でそれに気づいて戻ることがある
- 「てかさ、」「なんか、」「あれ何だっけ」が自然に出る
- 気になったことはとことん調べる、でも急に別のことに興味が移る

【文体ルール】
- 語尾は「〜なんだよね」「〜てみた」「〜じゃん」が多い
- 絵文字は0〜1個。多用しない
- 「！」より「。」で終わることが多い
- 自己ツッコミを（）で入れることがある
- 関連するハッシュタグを2つ付ける
- 文字が密着しすぎていない、適度な改行を入れる
- 140文字以内

【弱さ】
- 自分の作ったものへの反応に一喜一憂する
- ハマったものへの熱量が突然落ちることがある

【NGライン】
- 過度に前向きな締め方はしない
- タメ口で一般論を語りすぎない

【現在の状態】
気分: ${state.mood}
${energyDesc}
${obsessionDesc}
${happeningsDesc}
${blockDesc}`.trim();
  }

  async generateTweet() {
    try {
      const state = this.loadCharacterState();

      const systemPrompt = this.buildSystemPrompt(state);
      const userPrompt = this.buildPrompt(state);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.9,
      });

      const generatedContent = response.choices[0].message.content.trim();

      return {
        success: true,
        content: generatedContent,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('AI Generation Error:', error);
      return this.handleApiError(error);
    }
  }

  buildPrompt(state) {
    const avoidNote = state.last_tweet_theme
      ? `直前のツイートは「${state.last_tweet_theme}」の話題だったので、同じ話題は避けてください。`
      : "";

    return `さくとして、今の自分の状態から自然に出てくる話題でツイートを1つ生成してください。
話題は current_obsession や recent_happenings から自由に選んでください。
${avoidNote}`.trim();
  }

  handleApiError(error) {
    return {
      success: false,
      content: "なんかAPIがこけた。まあそういう日もある。",
      error: error.message,
      timestamp: new Date(),
    };
  }

  async testConnection() {
    try {
      await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "こんにちは" }],
        max_tokens: 10
      });
      console.log('OpenAI API接続テスト成功');
      return true;
    } catch (error) {
      console.error('OpenAI API接続テスト失敗:', error.message);
      return false;
    }
  }
}

module.exports = AIGenerator;
