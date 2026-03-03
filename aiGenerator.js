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

    this.promptTemplates = {
      saku: {
        themes: [
          "ステージ制作",
          "プロダクト開発の楽しさ",
          "配色の難しさ",
          "ゲームデザインの難しさ",
          "アクションの追加",
          "AIとゲーム開発",
          "エラーのありがたさ",
          "インディーゲームのマルチプレイヤー対応",
          "VR/ARゲーム開発",
          "モバイルゲーム最適化",
          "ゲームAIの実装",
          "リアルタイムレンダリング技術",
          "ゲーム内経済システム設計",
          "個人開発でのパブリッシング戦略",
          "ゲームエンジンの選び方",
          "デバッグとプロファイリング技術",
          "ChatGPT/Claude活用プログラミング",
          "AI生成コンテンツの品質向上",
          "ローカルAIモデルの活用",
          "AIプロンプトエンジニアリング",
          "Python×AI開発の基礎",
          "JavaScript/TypeScript実践",
          "React Server Components活用",
          "フロントエンド最新フレームワーク",
          "APIとマイクロサービス設計",
          "Git/GitHub効率的活用法",
          "コードレビューとチーム開発",
          "テスト駆動開発（TDD）",
          "AIを活用したパーソナライズUI",
          "3Dオブジェクトとアニメーション",
          "ダークモード対応設計",
          "音声UIとハンズフリー操作",
          "コンピューターネットワークの仕組み",
          "UXデザインの考え方",
          "レベルデザインの理論",
        ],
        exampleTweets: [
          "UIのトランジション、100回調整してやっと納得いった。でもなんか完成した瞬間に次のことが気になり始めた。",
          "ネットワークの仕組みを調べてたら気づいたら3時間経ってた。パケットの話、なんか好きなんだよね。",
          "レベルデザインって結局プレイヤーの動線を設計することなんだけど、それって全部UXの話と同じじゃんってなった。",
          "作ったものへの反応が薄いとやっぱへこむ。へこむけどまあ作り続けるんだよな。",
          "AIに任せるか自分で書くか、毎回悩む。任せると早いけど、自分で書いた方が後で理解できてる。",
        ]
      }
    };
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
- 140文字以内

【弱さ】
- 自分の作ったものへの反応に一喜一憂する
- ハマったものへの熱量が突然落ちることがある

【NGライン】
- 過度に前向きな締め方はしない
- タメ口で一般論を語りすぎない
- ハッシュタグは付けない

【現在の状態】
気分: ${state.mood}
${energyDesc}
${obsessionDesc}
${happeningsDesc}
${blockDesc}`.trim();
  }

  async generateTweet(promptType = 'saku') {
    try {
      const template = this.promptTemplates[promptType];
      if (!template) {
        throw new Error(`Unknown prompt type: ${promptType}`);
      }

      const state = this.loadCharacterState();

      // last_tweet_themeと同じテーマを避ける
      const themes = template.themes.filter(t => t !== state.last_tweet_theme);
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      console.log(`📝 Using topic: "${randomTheme}"`);

      const systemPrompt = this.buildSystemPrompt(state);
      const userPrompt = this.buildPrompt(template, randomTheme);

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

      // last_tweet_themeを更新
      this.updateLastTheme(randomTheme);

      return {
        success: true,
        content: generatedContent,
        timestamp: new Date(),
        promptType: promptType,
        theme: randomTheme
      };

    } catch (error) {
      console.error('AI Generation Error:', error);
      return this.handleApiError(error);
    }
  }

  buildPrompt(template, theme) {
    const examplesList = template.exampleTweets
      .map((tweet, index) => `${index + 1}. ${tweet}`)
      .join('\n\n');

    return `テーマ「${theme}」に基づいて、さくとしてツイートを1つ生成してください。
以下の例文のトーンを参考にしてください：
${examplesList}
`;
  }

  updateLastTheme(theme) {
    try {
      const state = this.loadCharacterState();
      state.last_tweet_theme = theme;
      fs.writeFileSync(this.characterStatePath, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to update last_tweet_theme:', err.message);
    }
  }

  handleApiError(error) {
    return {
      success: false,
      content: "なんかAPIがこけた。まあそういう日もある。",
      error: error.message,
      timestamp: new Date(),
      promptType: 'fallback'
    };
  }

  async testConnection() {
    try {
      const response = await this.openai.chat.completions.create({
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
