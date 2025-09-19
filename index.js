require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const tweetMessages = require('./tweets');

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

async function postTweet(content) {
  try {
    await rwClient.v2.tweet(content);
    console.log(`Posted: ${content}`);
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
}

// 日本時間8時
cron.schedule('0 23 * * *', () => {
  postTweet(tweetMessages.text1);
});

// 日本時間11時22分
cron.schedule('22 2 * * *', () => {
  postTweet(tweetMessages.text2);
});

// 日本時間14時45分
cron.schedule('45 5 * * *', () => {
  postTweet(tweetMessages.text3);
});

// 日本時間18時15分
cron.schedule('15 9 * * *', () => {
  postTweet(tweetMessages.text4);
});

// 日本時間21時54分
cron.schedule('54 12 * * *', () => {
  postTweet(tweetMessages.text5);
});

console.log('Bot started! Scheduled tweets are active.');