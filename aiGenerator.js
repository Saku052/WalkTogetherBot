require('dotenv').config();
const OpenAI = require('openai');

class AIGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.promptTemplates = {
      rakuten_mobile: {
        system: `あなたは楽天モバイルのマーケティング担当者です。魅力的で効果的なツイート文を生成してください。
以下の要件を満たしてください：
- 280文字以内
- 楽天モバイルの魅力を伝える
- ハッシュタグを2-3個含める
- 親しみやすくポジティブなトーン
- サラリーマンをターゲットにした内容`,
        themes: [
          "節約・投資促進とコスト削減の魅力",
          "楽天ポイント活用とポイ活のメリット", 
          "データ無制限の快適さと自由度",
          "楽天経済圏での効率化とスマート化",
          "通勤時間や自己投資機会の最大化"
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
      const finalContent = generatedContent + '\n\n▼キャンペーンはこちら\nhttps://r10.to/h5O3vB';

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
    return `テーマ「${theme}」に基づいて、楽天モバイルの魅力的なツイート文を1つ生成してください。
具体的で実用的な内容にし、読者が行動を起こしたくなるような文章にしてください。`;
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