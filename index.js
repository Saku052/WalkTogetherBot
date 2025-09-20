require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const tweetMessages = require('./tweets');
const AIGenerator = require('./aiGenerator');

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

// 日本時間8時 - AI生成ツイート
cron.schedule('0 23 * * *', () => {
  postAIGeneratedTweet();
});

// 日本時間11時18分 - AI生成ツイート
cron.schedule('18 2 * * *', () => {
  postAIGeneratedTweet();
});

// 日本時間14時45分 - AI生成ツイート
cron.schedule('45 5 * * *', () => {
  postAIGeneratedTweet();
});

// 日本時間18時15分 - AI生成ツイート
cron.schedule('15 9 * * *', () => {
  postAIGeneratedTweet();
});

// 日本時間21時54分 - AI生成ツイート
cron.schedule('54 12 * * *', () => {
  postAIGeneratedTweet();
});

console.log('Bot started! Scheduled tweets are active.');