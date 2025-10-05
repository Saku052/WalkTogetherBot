require('dotenv').config();
const OpenAI = require('openai');
const { TwitterApi } = require('twitter-api-v2');

class TrendAnalyzer {
  constructor(twitterClient) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // TwitterApiクライアントを受け取る（既存のものを再利用）
    this.twitterClient = twitterClient;
  }

  /**
   * Twitter APIでハッシュタグ検索してツイートを取得
   * @param {string[]} hashtags - 検索するハッシュタグの配列
   * @param {number} limit - 取得するツイート数の上限
   * @returns {Promise<string[]>} ツイート本文の配列
   */
  async fetchRecentTweets(hashtags, limit = 100) {
    try {
      // ハッシュタグをクエリに変換 (#ゲーム開発 OR #ゲーム制作 OR #プログラミング)
      const query = hashtags.map(tag => `#${tag}`).join(' OR ');

      // twitter-api-v2を使用
      const tweets = await this.twitterClient.v2.search(query, {
        max_results: Math.min(limit, 100),
        'tweet.fields': ['created_at', 'public_metrics']
      });

      const tweetTexts = [];
      for await (const tweet of tweets) {
        tweetTexts.push(tweet.text);
      }

      if (tweetTexts.length === 0) {
        console.log('No tweets found for hashtags:', hashtags);
      }

      return tweetTexts;

    } catch (error) {
      console.error('Error fetching tweets:', error);
      return [];
    }
  }

  /**
   * GPTを使ってツイート群から話題のトピックを抽出
   * @param {string[]} tweets - ツイート本文の配列
   * @returns {Promise<string[]>} 抽出されたトレンドトピックの配列
   */
  async extractTrendingTopics(tweets) {
    if (tweets.length === 0) {
      console.log('No tweets to analyze');
      return [];
    }

    try {
      // ツイートを結合（長すぎる場合は最初の50件に制限）
      const tweetsText = tweets.slice(0, 50).join('\n---\n');

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `あなたはトレンド分析の専門家です。ツイート群から今話題になっているトピックを抽出します。`
          },
          {
            role: "user",
            content: `以下のゲーム開発・プログラミング関連のツイート群から、今話題になっているトピックを3-5個抽出してください。

要件:
- 具体的な技術名、ツール名、トレンドを抽出
- 一般的すぎる単語（例:「プログラミング」「開発」）は避ける
- 抽出したトピックは、ゲーム開発者がツイートしたくなるような具体的な内容にする
- 各トピックは15文字以内で簡潔に
- JSON配列形式で返す: ["トピック1", "トピック2", ...]

ツイート群:
${tweetsText}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3, // 低めにして安定した抽出
      });

      const content = response.choices[0].message.content.trim();

      // JSON配列をパース
      try {
        // JSONブロックから配列を抽出
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const topics = JSON.parse(jsonMatch[0]);
          return topics.filter(topic => topic && topic.length > 0);
        }
      } catch (parseError) {
        console.error('Failed to parse topics JSON:', parseError);
      }

      // パース失敗時は改行区切りで分割を試みる
      return content.split('\n')
        .map(line => line.trim().replace(/^[-•*]\s*/, '').replace(/[\"\']/g, ''))
        .filter(line => line.length > 0 && line.length <= 30)
        .slice(0, 5);

    } catch (error) {
      console.error('Error extracting trending topics:', error);
      return [];
    }
  }

  /**
   * トレンド分析を実行してトピックを取得
   * @param {string[]} hashtags - 検索するハッシュタグ
   * @returns {Promise<Object>} 分析結果
   */
  async analyzeTrends(hashtags = ['ゲーム開発', 'ゲーム制作', 'プログラミング']) {
    console.log('Starting trend analysis for hashtags:', hashtags);

    const tweets = await this.fetchRecentTweets(hashtags, 100);
    console.log(`Fetched ${tweets.length} tweets`);

    const trendingTopics = await this.extractTrendingTopics(tweets);
    console.log('Extracted trending topics:', trendingTopics);

    return {
      success: trendingTopics.length > 0,
      topics: trendingTopics,
      tweetCount: tweets.length,
      timestamp: new Date()
    };
  }
}

module.exports = TrendAnalyzer;
