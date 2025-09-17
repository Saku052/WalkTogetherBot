require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');

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

cron.schedule('0 9 * * *', () => {
  postTweet('おはようございます！楽天モバイル社員紹介キャンペーン。今なら相当なポイントがもらえます！');
});

cron.schedule('0 13 * * *', () => {
  postTweet('楽天モバイル2,980円で無制限！全国エリア対応で快適通信✨社員紹介キャンペーン実施中🎉\nhttps://refer.rakuten.co.jp/participation/auth?campaign=referralmobile_en&inv=HogkjQ1qqpbL-ecSVo3nRWYOgZCZSNch4RHSC8VgWv4%3D&scid=su_15404');
});

cron.schedule('0 18 * * *', () => {
  postTweet('今日も1日お疲れ様です！楽天モバイル社員紹介キャンペーン。今なら相当なポイントがもらえます！');
});

console.log('Bot started! Scheduled tweets are active.');