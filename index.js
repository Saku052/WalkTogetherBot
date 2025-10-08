require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const tweetMessages = require('./tweets');
const AIGenerator = require('./aiGenerator');
const TrendAnalyzer = require('./trendAnalyzer');

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;
const aiGenerator = new AIGenerator();
const trendAnalyzer = new TrendAnalyzer(client.readOnly);

// トレンドトピックファイルのパス
const TRENDING_TOPICS_FILE = path.join(__dirname, 'trendingTopics.json');

/**
 * トレンドトピックをファイルから読み込む
 * @returns {Promise<string[]>} トレンドトピックの配列
 */
async function loadTrendingTopics() {
  try {
    const data = await fs.readFile(TRENDING_TOPICS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.topics || [];
  } catch (error) {
    console.error('Failed to load trending topics from file:', error);
    return [];
  }
}

/**
 * トレンドトピックをファイルに保存
 * @param {string[]} topics - トレンドトピックの配列
 * @param {string} source - トピックのソース ('twitter' または 'manual')
 */
async function saveTrendingTopics(topics, source = 'twitter') {
  try {
    const data = {
      topics,
      lastUpdated: new Date().toISOString(),
      source
    };
    await fs.writeFile(TRENDING_TOPICS_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Trending topics saved to file (${topics.length} topics)`);
  } catch (error) {
    console.error('Failed to save trending topics to file:', error);
  }
}

async function postTweet(content) {
  try {
    await rwClient.v2.tweet(content);
    console.log(`Posted: ${content}`);
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
}

async function updateTrendingTopics() {
  try {
    console.log('🔍 Updating trending topics...');
    const result = await trendAnalyzer.analyzeTrends(['ゲーム開発', 'ゲーム制作', 'プログラミング']);

    if (result.success) {
      // メモリに保存
      aiGenerator.updateTrendingTopics(result.topics);

      // ファイルに保存
      await saveTrendingTopics(result.topics, 'twitter');

      console.log(`✅ Trending topics updated (${result.topics.length} topics from ${result.tweetCount} tweets):`);
      result.topics.forEach((topic, index) => {
        console.log(`   ${index + 1}. ${topic}`);
      });
    } else {
      console.log('⚠️ No trending topics found, using base themes');
    }
  } catch (error) {
    console.error('❌ Error updating trending topics:', error);
  }
}

async function postAIGeneratedTweet() {
  try {
    console.log('Generating AI tweet...');
    const result = await aiGenerator.generateTweet();

    if (result.success) {
      await postTweet(result.content);
      console.log(`AI Generated Tweet Success - Theme: ${result.theme}`);
    } else {
      console.log('AI generation failed, using fallback content');
      await postTweet(result.content);
    }
  } catch (error) {
    console.error('Error in AI tweet generation:', error);
    // 完全なフォールバック - 既存のメッセージを使用
    const fallbackMessages = Object.values(tweetMessages);
    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    await postTweet(randomMessage);
  }
}


// ========================================
// トレンド分析スケジュール
// ========================================

// 毎時0分にトレンドトピックを更新（Twitter API制限に配慮）
cron.schedule('30 * * * *', () => {
  updateTrendingTopics();
}, {
  timezone: "Asia/Tokyo"
});

// ========================================
// 平日最適化スケジュール (成功率分析結果)
// ========================================

// 平日 0時15分 - 80%成功率
cron.schedule('15 0 * * 1-5', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// 平日 2時30分 - 80%成功率
cron.schedule('30 2 * * 1-5', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// 平日 21時45分 - 75%成功率
cron.schedule('45 21 * * 1-5', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// 平日 23時10分 - 75%成功率
cron.schedule('10 23 * * 1-5', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// ========================================
// 休日最適化スケジュール (成功率分析結果)
// ========================================

// 休日 2時20分 - 100%成功率
cron.schedule('20 2 * * 6,0', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// 休日 5時35分 - 100%成功率
cron.schedule('35 5 * * 6,0', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// 休日 14時25分 - 昼休み効果
cron.schedule('25 14 * * 6,0', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

// 休日 23時50分 - 75%成功率
cron.schedule('29 22 * * 6,0', () => {
  postAIGeneratedTweet();
}, {
  timezone: "Asia/Tokyo"
});

console.log('Bot started! Scheduled tweets are active.');
console.log('📈 Added optimized weekday schedule based on success rate analysis.');
console.log('🏖️ Added optimized weekend schedule with 100% success rate times.');
console.log('🔍 Trend analysis scheduled hourly.');

// 起動時にファイルからトレンドトピックを読み込む
(async () => {
  console.log('🚀 Loading trending topics from file...');
  const savedTopics = await loadTrendingTopics();
  if (savedTopics.length > 0) {
    aiGenerator.updateTrendingTopics(savedTopics);
    console.log(`✅ Trending topics loaded from file: ${savedTopics.join(', ')}`);
  } else {
    console.log('⚠️ No saved trending topics found, using defaults');
  }
})();