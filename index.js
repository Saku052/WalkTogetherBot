require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const tweetMessages = require('./tweets');
const AIGenerator = require('./aiGenerator');
require('./discordBot');

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;
const aiGenerator = new AIGenerator();

async function postTweet(content) {
  try {
    await rwClient.v2.tweet(content);
    console.log(`Posted: ${content}`);
  } catch (error) {
    console.error('Error posting tweet:', error);
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

// 平日 21時58分 - 75%成功率
cron.schedule('58 21 * * 1-5', () => {
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

// 平日 14時48分 - 75%成功率
cron.schedule('48 14 * * 1-5', () => {
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
