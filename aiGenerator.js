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
- ハッシュタグを2-3個含める(例:#ゲーム開発 #ゲーム制作 #プログラミング）
- 専門用語は避け、ゲーム開発に興味のある人なら誰でも理解できる言葉を選ぶ`,
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
    return `テーマ「${theme}」に基づいて、ツイート文を1つ生成してください。
以下の例文のような構成にしてください：
  [僕は結局Claude Codeばかり使っています。理由としては
・Claude Codeで困ることが現状ない(ポンコツ改善された気がする)
・Claude Codeの方がコード出力が早い],
[グーグル画像生成AI「Nano Banana」超便利に使える“神アプリ”　AI開発で続々登場
Google AI StudioのBuildを利用することで、Nano Bananaと連携した便利で強力なアプリを簡単に作れることを紹介します。文中で触れた筆者作成のアプリリンクも最後に公開しています。],
[最近、ゲームのバランステストしてみたんだけど、思ったより敵が強すぎて笑った😂😊調整が楽しい！試行錯誤しながら、プレイヤーの気持ちを考えるって大事だね〜],
[GitHubの効率的活用法を探してるんだけど、やっぱりブランチ活用がめっちゃ便利✨作業ごとに分けておくと、バグ修正も楽チンなんだよね！みんなも試してみて〜！],
[就活の時GitHub見られるって聞いたから結構頑張って継続してきたつもりだけど、全部埋まってる人のツイート見つけて震えてる],
[ソフトウェアエンジニア職は鬱になりやすいと言われるが鬱になりやすい奴がエンジニア職（プログラマ）を目指しがちという方がおそらく正しい気がする...],
[ふと思ってんけど、バイブコーティングが普通になってきて、学習量の問題が改善されてくると、もしかすると静的言語の方が有利になってこない？
もしくはそれに特化した言語とかもう作ってる人いそうやな。多分今後はハルシネーション問題も少なくなって来そうやし。],
[ステージ制作で壁にぶつかった💦レベルデザインって、見た目だけじゃなくてプレイヤーの動きも考えなきゃいけないんだよね！試行錯誤して、友達にプレイしてもらったら改善点が見えてきた✨やっぱり人の意見って大事だね！],
`;
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