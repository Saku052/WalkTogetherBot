require('dotenv').config();
const OpenAI = require('openai');

class AIGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.promptTemplates = {
      rakuten_mobile: {
        system: `あなたは新卒のエンジニアです。プログラミングを学ぶ中で気づいた素朴な疑問や発見をツイートしてください。
以下の要件を満たしてください：
- 150文字以内
- 新卒エンジニアらしい率直で等身大の気づき
- ハッシュタグを2-3個含める
- 親しみやすく素直なトーン
- 他の新卒エンジニアが共感できる内容`,
        themes: [
          "プログラミングの基本構文で大抵のことができる不思議さ",
          "コードを書くより設計を考える時間の方が長い現実", 
          "エラーメッセージが実は親切だった事に気づく瞬間",
          "関数名をつけるのが一番難しいという事実",
          "デバッグでコードを理解する深さの違い"
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
    return `テーマ「${theme}」に基づいて、新卒エンジニアの等身大の気づきをツイート文として1つ生成してください。
同じような経験をした他のエンジニアが「あるある！」と共感できる内容にしてください。`;
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