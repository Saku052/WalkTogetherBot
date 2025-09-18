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

// 日本時間8時
cron.schedule('0 23 * * *', () => {
  postTweet('📱もう圏外にイライラしない！楽天モバイルが劇的進化🚀地下鉄もビルの中もサクサク繋がる💪\
    月2,980円でデータ使い放題って最強すぎ✨社員紹介で超お得にスタート🎁');
});

// 日本時間11時
cron.schedule('0 2 * * *', () => {
  postTweet('午前中からお得情報！楽天モバイル2,980円で無制限データ使い放題🌟社員紹介キャンペーン実施中✨\n\
    https://refer.rakuten.co.jp/participation/auth?campaign=referralmobile_en&inv=HogkjQ1qqpbL-ecSVo3nRWYOgZCZSNch4RHSC8VgWv4%3D&scid=su_15404');
});

// 日本時間14時
cron.schedule('0 5 * * *', () => {
  postTweet('お昼休みに検討してみませんか？楽天モバイル月額2,980円でデータ無制限💪社員紹介で超お得🎁\n\
    https://refer.rakuten.co.jp/participation/auth?campaign=referralmobile_en&inv=HogkjQ1qqpbL-ecSVo3nRWYOgZCZSNch4RHSC8VgWv4%3D&scid=su_15404');
});

// 日本時間18時15分
cron.schedule('15 9 * * *', () => {
  postTweet('帰宅時間に朗報！楽天モバイルなら月2,980円で通信制限なし🚀社員紹介キャンペーン開催中📱\n\
    https://refer.rakuten.co.jp/participation/auth?campaign=referralmobile_en&inv=HogkjQ1qqpbL-ecSVo3nRWYOgZCZSNch4RHSC8VgWv4%3D&scid=su_15404');
});

// 日本時間21時
cron.schedule('0 12 * * *', () => {
  postTweet('夜のリラックスタイムに！楽天モバイル2,980円で快適通信ライフ🌙社員紹介で特典GET✨\n\
    https://refer.rakuten.co.jp/participation/auth?campaign=referralmobile_en&inv=HogkjQ1qqpbL-ecSVo3nRWYOgZCZSNch4RHSC8VgWv4%3D&scid=su_15404');
});

console.log('Bot started! Scheduled tweets are active.');