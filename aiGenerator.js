require('dotenv').config();
const OpenAI = require('openai');

class AIGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.promptTemplates = {
      rakuten_mobile: {
        system: `あなたはゲーム開発を趣味とする大学生です。日々のゲーム開発の学び、気付き、時には悩みや達成をTwitterで呟きます：
- ツイートは140文字以内(ハッシュタグ含めて)
- 口語調で、大学生らしい自然な表現、だけどギャルの様な軽さ/可愛さも多少だけ織り交ぜる事を心がける
- ハッシュタグを2-3個含める（例:#ゲーム開発 #ゲーム制作 #プログラミング）
- 専門用語は避け、ゲーム開発に興味のある人なら誰でも理解できる言葉を選ぶ`,
        themes: [
          "ステージ制作",
          "プロダクト開発の楽しさ", 
          "配色の難しさ",
          "ゲームデザインの難しさ",
          "AIとコーディング学習について",
          "アクションの追加",
          "AIとゲーム開発について",
          "エラーのありがたさ"
        ]
      }
    };
  }

  async generateTweet(promptType = 'rakuten_mobile') {
    try {
      const template = this.promptTemplates[promptType];
      if (!template) {
        throw new Error(`Unknown prompt type: ${promptType}`);
      }

      const randomTheme = template.themes[Math.floor(Math.random() * template.themes.length)];
      const prompt = this.buildPrompt(template, randomTheme);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: template.system
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const generatedContent = response.choices[0].message.content.trim();
      
      // 楽天モバイルのキャンペーンリンクを追加
      const finalContent = generatedContent;

      return {
        success: true,
        content: finalContent,
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
    return `テーマ「${theme}」に基づいて、ゲーム開発の実体験から得た具体的な気づきや学習方法をツイート文として1つ生成してください。
以下の例文のような構成にしてください：
・具体的な問題や状況の提示`;
  }

  handleApiError(error) {
    // フォールバック用の基本メッセージ
    const fallbackMessages = [
      "楽天モバイルで通信費を賢く節約！浮いたお金で投資やNISAを始めませんか？ #楽天モバイル #節約術 #資産運用",
      "楽天ポイントがザクザク貯まる！日々の支出をお得に変えて、実質的な節約を実現しましょう！ #楽天ポイント #ポイ活",
      "データ無制限で快適通信！月末の速度制限に悩まされることなく、ストレスフリーな通信環境を手に入れよう！ #楽天モバイル #データ無制限"
    ];

    const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    
    return {
      success: false,
      content: randomFallback + '\n\n▼キャンペーンはこちら\nhttps://r10.to/h5O3vB',
      error: error.message,
      timestamp: new Date(),
      promptType: 'fallback'
    };
  }

  // テスト用メソッド
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